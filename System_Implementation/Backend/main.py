from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
import numpy as np
import io
import sqlite3
from datetime import datetime
from database import conn, cursor

WINDOW_LEN = 3750

# DEMO MODE ONLY
# True  = prediction cycles: Low -> Normal -> High
# False = use real model prediction only
DEMO_MODE = True

demo_counter = {
    "ecg": 0,
    "ppg": 0,
    "resp": 0,
    "ppg_resp": 0,
    "ecg_ppg_resp": 0,
}

app = FastAPI(title="AI Blood Pressure Monitoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def safe_load_model(path):
    """
    Loads a Keras model safely.
    If a custom layer error happens, the app will still run.
    This is useful for demo mode so Dual/Tri do not crash the backend.
    """
    try:
        model = load_model(path, compile=False)
        print(f"Loaded model successfully: {path}")
        return model
    except Exception as e:
        print("================================")
        print(f"WARNING: Could not load model: {path}")
        print("Reason:", str(e))
        print("The API will continue running. Demo mode will be used if enabled.")
        print("================================")
        return None


models = {
    "ecg": safe_load_model("Model/best_ECG_LSTM.keras"),
    "ppg": safe_load_model("Model/best_PPG_CNN (2).keras"),
    "resp": safe_load_model("Model/best_RESP_LSTM.keras"),
}

dual_models = {
    "ppg_resp": safe_load_model("Model/best_PPG_RESP.keras"),
}

tri_models = {
    "ecg_ppg_resp": safe_load_model("Model/best_tri_modality.keras"),
}

model_names = {
    "ecg": "ECG LSTM",
    "ppg": "PPG CNN",
    "resp": "RESP LSTM",
}

dual_model_names = {
    "ppg_resp": "PPG + RESP Model",
}

tri_model_names = {
    "ecg_ppg_resp": "ECG + PPG + RESP Tri Model",
}


def prepare_single_signal(file_bytes):
    signal = np.load(io.BytesIO(file_bytes))
    signal = np.array(signal)

    if signal.ndim == 2:
        if signal.shape[1] == WINDOW_LEN:
            signal = signal[0]
        elif signal.shape[0] == WINDOW_LEN:
            signal = signal[:, 0]
        else:
            signal = signal.flatten()

    elif signal.ndim > 2:
        signal = signal.reshape(-1)

    signal = np.squeeze(signal)

    if len(signal) > WINDOW_LEN:
        signal = signal[:WINDOW_LEN]

    if len(signal) < WINDOW_LEN:
        signal = np.pad(signal, (0, WINDOW_LEN - len(signal)))

    signal = signal.astype(np.float32)
    signal = np.expand_dims(signal, axis=-1)
    signal = np.expand_dims(signal, axis=0)

    return signal


def predict_with_model(model, input_list):
    """
    Supports both:
    1) single-input models with stacked channels: (1, 3750, C)
    2) multi-input models: [signal1, signal2, signal3]
    """
    if model is None:
        return None

    if len(model.inputs) == 1:
        combined = np.concatenate(input_list, axis=-1)
        return model.predict(combined)

    return model.predict(input_list)


def apply_demo_result(key, sbp=None, dbp=None):
    """
    In DEMO_MODE, cycle every key through:
    Low -> Normal -> High
    """
    if not DEMO_MODE:
        return sbp, dbp

    demo_counter[key] += 1
    current_demo = demo_counter[key] % 3

    if current_demo == 1:
        return 85, 55
    elif current_demo == 2:
        return 120, 75
    else:
        return 155, 95


def get_status(sbp, dbp):
    if sbp >= 140 or dbp >= 90:
        return "High"
    elif sbp < 90 and dbp < 60:
        return "Low"
    else:
        return "Normal"


def save_prediction(patient_id, sbp, dbp, status, timestamp):
    cursor.execute(
        """
        INSERT INTO predictions
        (patient_id, sbp, dbp, status, timestamp)
        VALUES (?, ?, ?, ?, ?)
        """,
        (patient_id, sbp, dbp, status, timestamp)
    )
    conn.commit()


@app.get("/")
def home():
    return {
        "message": "BP Prediction API Running",
        "single_models": ["ecg", "ppg", "resp"],
        "dual_models": ["ppg_resp"],
        "tri_models": ["ecg_ppg_resp"],
        "demo_mode": DEMO_MODE,
        "loaded_models": {
            "ecg": models["ecg"] is not None,
            "ppg": models["ppg"] is not None,
            "resp": models["resp"] is not None,
            "ppg_resp": dual_models["ppg_resp"] is not None,
            "ecg_ppg_resp": tri_models["ecg_ppg_resp"] is not None,
        }
    }


@app.post("/signup")
def signup(
    patient_id: str = Form(...),
    password: str = Form(...),
    modality_type: str = Form(...),
    signal_config: str = Form(...)
):
    try:
        patient_id = patient_id.strip()
        modality_type = modality_type.lower().strip()
        signal_config = signal_config.lower().strip()

        allowed_modalities = ["single", "dual", "tri"]
        allowed_configs = [
            "ecg", "ppg", "resp",
            "ecg_ppg", "ecg_resp", "ppg_resp",
            "ecg_ppg_resp"
        ]

        if modality_type not in allowed_modalities:
            raise HTTPException(status_code=400, detail="Invalid modality type")

        if signal_config not in allowed_configs:
            raise HTTPException(status_code=400, detail="Invalid signal configuration")

        cursor.execute(
            """
            INSERT INTO users
            (patient_id, password, modality_type, signal_config)
            VALUES (?, ?, ?, ?)
            """,
            (patient_id, password, modality_type, signal_config)
        )
        conn.commit()

        return {
            "message": "Patient account created successfully",
            "patient_id": patient_id,
            "modality_type": modality_type,
            "signal_config": signal_config
        }

    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Patient ID already exists")


@app.post("/signin")
def signin(
    patient_id: str = Form(...),
    password: str = Form(...)
):
    patient_id = patient_id.strip()

    cursor.execute(
        """
        SELECT patient_id, modality_type, signal_config
        FROM users
        WHERE patient_id = ? AND password = ?
        """,
        (patient_id, password)
    )

    user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid Patient ID or password")

    return {
        "message": "Patient login successful",
        "patient_id": user[0],
        "modality_type": user[1],
        "signal_config": user[2]
    }


@app.post("/relative-signup")
def relative_signup(
    patient_id: str = Form(...),
    relative_name: str = Form(...),
    relationship: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...)
):
    try:
        patient_id = patient_id.strip()
        relative_name = relative_name.strip()
        relationship = relationship.strip()
        phone = phone.strip()

        cursor.execute(
            """
            SELECT patient_id
            FROM users
            WHERE patient_id = ?
            """,
            (patient_id,)
        )

        patient = cursor.fetchone()

        if not patient:
            raise HTTPException(status_code=404, detail="Patient ID does not exist")

        cursor.execute(
            """
            INSERT INTO relatives
            (password, patient_id, relative_name, relationship, phone)
            VALUES (?, ?, ?, ?, ?)
            """,
            (password, patient_id, relative_name, relationship, phone)
        )
        conn.commit()

        return {
            "message": "Relative account created successfully",
            "patient_id": patient_id,
            "relative_name": relative_name,
            "relationship": relationship,
            "phone": phone
        }

    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Relative account already exists")


@app.post("/relative-signin")
def relative_signin(
    patient_id: str = Form(...),
    relative_name: str = Form(...),
    password: str = Form(...)
):
    patient_id = patient_id.strip()
    relative_name = relative_name.strip()

    cursor.execute(
        """
        SELECT patient_id, relative_name
        FROM relatives
        WHERE patient_id = ?
        AND relative_name = ?
        AND password = ?
        """,
        (patient_id, relative_name, password)
    )

    relative = cursor.fetchone()

    if not relative:
        raise HTTPException(
            status_code=401,
            detail="Invalid Patient ID, Relative Name, or password"
        )

    return {
        "message": "Relative login successful",
        "patient_id": relative[0],
        "relative_name": relative[1]
    }


@app.post("/predict-single")
async def predict_single(
    patient_id: str = Form(...),
    signal_type: str = Form(...),
    signal_file: UploadFile = File(...)
):
    try:
        patient_id = patient_id.strip()
        signal_type = signal_type.lower().strip()

        if signal_type not in models:
            raise HTTPException(
                status_code=400,
                detail="Invalid signal type. Use ecg, ppg, or resp."
            )

        file_bytes = await signal_file.read()
        signal = prepare_single_signal(file_bytes)

        print("================================")
        print("Prediction Type: SINGLE")
        print("Signal Type:", signal_type)
        print("File Name:", signal_file.filename)
        print("Signal Shape:", signal.shape)
        print("Signal Min:", np.min(signal))
        print("Signal Max:", np.max(signal))
        print("Signal Mean:", np.mean(signal))
        print("================================")

        model = models[signal_type]

        if model is not None:
            prediction = model.predict(signal)
            print("Prediction:", prediction)
            sbp = round(float(prediction[0][0]), 2)
            dbp = round(float(prediction[0][1]), 2)
        else:
            if not DEMO_MODE:
                raise HTTPException(status_code=500, detail=f"{signal_type.upper()} model is not loaded.")
            sbp, dbp = None, None

        sbp, dbp = apply_demo_result(signal_type, sbp, dbp)

        status = get_status(sbp, dbp)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        save_prediction(patient_id, sbp, dbp, status, timestamp)

        return {
            "patient_id": patient_id,
            "modality_type": "SINGLE",
            "signal_type": signal_type.upper(),
            "sbp": sbp,
            "dbp": dbp,
            "status": status,
            "timestamp": timestamp,
            "model_used": model_names[signal_type],
            "model_loaded": model is not None,
            "demo_mode": DEMO_MODE,
            "saved_to_database": True
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict-dual")
async def predict_dual(
    patient_id: str = Form(...),
    ppg_file: UploadFile = File(...),
    resp_file: UploadFile = File(...)
):
    try:
        patient_id = patient_id.strip()
        model_key = "ppg_resp"

        ppg_bytes = await ppg_file.read()
        resp_bytes = await resp_file.read()

        ppg_signal = prepare_single_signal(ppg_bytes)
        resp_signal = prepare_single_signal(resp_bytes)

        print("================================")
        print("Prediction Type: DUAL")
        print("Signal Config: PPG + RESP")
        print("PPG File:", ppg_file.filename, "Shape:", ppg_signal.shape)
        print("RESP File:", resp_file.filename, "Shape:", resp_signal.shape)
        print("================================")

        model = dual_models[model_key]

        if model is not None:
            prediction = predict_with_model(model, [ppg_signal, resp_signal])
            print("Prediction:", prediction)
            sbp = round(float(prediction[0][0]), 2)
            dbp = round(float(prediction[0][1]), 2)
        else:
            if not DEMO_MODE:
                raise HTTPException(status_code=500, detail="Dual model is not loaded.")
            sbp, dbp = None, None

        sbp, dbp = apply_demo_result(model_key, sbp, dbp)

        status = get_status(sbp, dbp)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        save_prediction(patient_id, sbp, dbp, status, timestamp)

        return {
            "patient_id": patient_id,
            "modality_type": "DUAL",
            "signal_config": "PPG + RESP",
            "sbp": sbp,
            "dbp": dbp,
            "status": status,
            "timestamp": timestamp,
            "model_used": dual_model_names[model_key],
            "model_loaded": model is not None,
            "demo_mode": DEMO_MODE,
            "saved_to_database": True
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict-tri")
async def predict_tri(
    patient_id: str = Form(...),
    ecg_file: UploadFile = File(...),
    ppg_file: UploadFile = File(...),
    resp_file: UploadFile = File(...)
):
    try:
        patient_id = patient_id.strip()
        model_key = "ecg_ppg_resp"

        ecg_bytes = await ecg_file.read()
        ppg_bytes = await ppg_file.read()
        resp_bytes = await resp_file.read()

        ecg_signal = prepare_single_signal(ecg_bytes)
        ppg_signal = prepare_single_signal(ppg_bytes)
        resp_signal = prepare_single_signal(resp_bytes)

        print("================================")
        print("Prediction Type: TRI")
        print("Signal Config: ECG + PPG + RESP")
        print("ECG File:", ecg_file.filename, "Shape:", ecg_signal.shape)
        print("PPG File:", ppg_file.filename, "Shape:", ppg_signal.shape)
        print("RESP File:", resp_file.filename, "Shape:", resp_signal.shape)
        print("================================")

        model = tri_models[model_key]

        if model is not None:
            prediction = predict_with_model(model, [ecg_signal, ppg_signal, resp_signal])
            print("Prediction:", prediction)
            sbp = round(float(prediction[0][0]), 2)
            dbp = round(float(prediction[0][1]), 2)
        else:
            if not DEMO_MODE:
                raise HTTPException(status_code=500, detail="Tri model is not loaded.")
            sbp, dbp = None, None

        sbp, dbp = apply_demo_result(model_key, sbp, dbp)

        status = get_status(sbp, dbp)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        save_prediction(patient_id, sbp, dbp, status, timestamp)

        return {
            "patient_id": patient_id,
            "modality_type": "TRI",
            "signal_config": "ECG + PPG + RESP",
            "sbp": sbp,
            "dbp": dbp,
            "status": status,
            "timestamp": timestamp,
            "model_used": tri_model_names[model_key],
            "model_loaded": model is not None,
            "demo_mode": DEMO_MODE,
            "saved_to_database": True
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history/{patient_id}")
def get_patient_history(patient_id: str):
    patient_id = patient_id.strip()

    cursor.execute(
        """
        SELECT patient_id, sbp, dbp, status, timestamp
        FROM predictions
        WHERE patient_id = ?
        ORDER BY timestamp ASC
        """,
        (patient_id,)
    )

    rows = cursor.fetchall()

    history = [
        {
            "patient_id": row[0],
            "sbp": row[1],
            "dbp": row[2],
            "status": row[3],
            "timestamp": row[4]
        }
        for row in rows
    ]

    return {
        "patient_id": patient_id,
        "history": history
    }


@app.get("/patients")
def get_patients():
    cursor.execute(
        """
        SELECT patient_id
        FROM users
        ORDER BY patient_id ASC
        """
    )

    rows = cursor.fetchall()

    return {
        "patients": [row[0] for row in rows]
    }


@app.get("/relative-alert/{patient_id}/{relative_name}")
def get_relative_alert(patient_id: str, relative_name: str):
    patient_id = patient_id.strip()
    relative_name = relative_name.strip()

    cursor.execute(
        """
        SELECT patient_id
        FROM relatives
        WHERE patient_id = ?
        AND relative_name = ?
        """,
        (patient_id, relative_name)
    )

    relative = cursor.fetchone()

    if not relative:
        raise HTTPException(status_code=404, detail="Relative not found")

    cursor.execute(
        """
        SELECT patient_id, sbp, dbp, status, timestamp
        FROM predictions
        WHERE patient_id = ?
        ORDER BY timestamp DESC
        LIMIT 1
        """,
        (patient_id,)
    )

    row = cursor.fetchone()

    if not row:
        return {
            "patient_id": patient_id,
            "alert": None
        }

    return {
        "patient_id": patient_id,
        "alert": {
            "patient_id": row[0],
            "sbp": round(row[1]),
            "dbp": round(row[2]),
            "status": row[3],
            "timestamp": row[4]
        }
    }


@app.get("/relative-history/{patient_id}/{relative_name}")
def get_relative_history(patient_id: str, relative_name: str):
    patient_id = patient_id.strip()
    relative_name = relative_name.strip()

    cursor.execute(
        """
        SELECT patient_id
        FROM relatives
        WHERE patient_id = ?
        AND relative_name = ?
        """,
        (patient_id, relative_name)
    )

    relative = cursor.fetchone()

    if not relative:
        raise HTTPException(status_code=404, detail="Relative not found")

    cursor.execute(
        """
        SELECT patient_id, sbp, dbp, status, timestamp
        FROM predictions
        WHERE patient_id = ?
        ORDER BY timestamp ASC
        """,
        (patient_id,)
    )

    rows = cursor.fetchall()

    history = [
        {
            "patient_id": row[0],
            "sbp": row[1],
            "dbp": row[2],
            "status": row[3],
            "timestamp": row[4]
        }
        for row in rows
    ]

    return {
        "patient_id": patient_id,
        "relative_name": relative_name,
        "history": history
    }


@app.get("/emergency-contact/{patient_id}")
def get_emergency_contact(patient_id: str):
    patient_id = patient_id.strip()

    cursor.execute(
        """
        SELECT relative_name, relationship, phone
        FROM relatives
        WHERE patient_id = ?
        LIMIT 1
        """,
        (patient_id,)
    )

    contact = cursor.fetchone()

    if not contact:
        return {
            "patient_id": patient_id,
            "contact": None
        }

    return {
        "patient_id": patient_id,
        "contact": {
            "name": contact[0],
            "relationship": contact[1],
            "phone": contact[2]
        }
    }

@app.get("/login-options")
def login_options():

    cursor.execute("""
        SELECT patient_id, modality_type, signal_config
        FROM users
        ORDER BY patient_id
    """)

    patients = cursor.fetchall()

    cursor.execute("""
        SELECT patient_id, relative_name
        FROM relatives
        ORDER BY patient_id
    """)

    relatives = cursor.fetchall()

    return {
        "patients": [
            {
                "patient_id": row[0],
                "modality_type": row[1],
                "signal_config": row[2]
            }
            for row in patients
        ],

        "relatives": [
            {
                "patient_id": row[0],
                "relative_name": row[1]
            }
            for row in relatives
        ]
    }