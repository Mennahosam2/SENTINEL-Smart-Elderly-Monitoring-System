import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./App.css";
import elderlyPatientImg from "./assets/elderly-patient.png";

const API_URL = "http://127.0.0.1:8000";

const T = {
  en: {
    appName: "SENTINEL",
    appTagline: "AI-Powered Blood Pressure Monitoring",
    heroTitle: "Your Heart's Trusted Guardian",
    heroSub:
      "Advanced AI monitoring that watches over elderly patients 24/7, giving families peace of mind.",
    heroPatient: "I'm a Patient",
    heroRelative: "I'm a Relative",
    navHome: "Home",
    navPatient: "Patient Portal",
    navRelative: "Relative Portal",
    navDashboard: "Dashboard",
    signIn: "Sign In",
    signUp: "Sign Up",
    patient: "Patient",
    relative: "Relative",
    patientId: "Patient ID",
    password: "Password",
    signInBtn: "Sign In",
    createAccount: "Create Account",
    measurementType: "Measurement Type",
    defaultSignal: "Default Signal Type",
    single: "Single",
    dual: "Dual",
    tri: "Tri",
    linkedPatientId: "Linked Patient ID",
    relativeName: "Relative Name",
    relationship: "Relationship",
    relationshipHint: "Son, Daughter, Wife…",
    phoneNumber: "Phone Number",
    createRelativeAccount: "Create Relative Account",
    patientSignIn: "Patient Sign In",
    patientSignUp: "Patient Sign Up",
    relativeSignIn: "Relative Sign In",
    relativeSignUp: "Relative Sign Up",
    uploadSignal: "Upload Signal",
    uploadSignalFile: "Upload Signal File",
    checkBP: "Check My Blood Pressure",
    checking: "Analyzing…",
    normal: "NORMAL",
    low: "LOW",
    high: "HIGH",
    normalMsg: "Your blood pressure is within the healthy range.",
    lowMsg: "Your blood pressure is below normal. Please rest and stay hydrated.",
    highMsg:
      "Your blood pressure is elevated. Please contact your doctor or relative immediately.",
    emergencyContact: "Emergency Contact",
    noEmergency: "No emergency contact registered.",
    callRelative: "Call Relative Now",
    bpGuide: "Blood Pressure Guide",
    normalGuide: "Healthy Range",
    lowGuide: "Below Normal",
    highGuide: "Above Normal",
    pleaseUpload: "Required Signal",
    monitoringPatient: "Monitoring Patient",
    downloadReport: "Download Report",
    recentAlert: "Latest Alert",
    noReadings: "No readings available yet.",
    latestSBP: "Latest SBP",
    latestDBP: "Latest DBP",
    avgSBP: "Average SBP",
    avgDBP: "Average DBP",
    highestSBP: "Peak SBP",
    highestDBP: "Peak DBP",
    bpTrend: "Blood Pressure Trend",
    trendAnalysis: "Trend Analysis",
    sbpChange: "SBP Change",
    dbpChange: "DBP Change",
    warnSBP: "⚠ Sudden increase in SBP detected",
    warnDBP: "⚠ Sudden increase in DBP detected",
    safe: "Readings stable. No sudden changes detected.",
    historyTable: "Reading History",
    timestamp: "Time",
    sbp: "SBP",
    dbp: "DBP",
    status: "Status",
    logout: "Sign Out",
    feature1Title: "AI-Powered Analysis",
    feature1Desc:
      "Multi-signal ECG, PPG & respiratory analysis using deep learning.",
    feature2Title: "Real-Time Alerts",
    feature2Desc:
      "Instant notifications to family members when readings are critical.",
    feature3Title: "Elderly-Friendly",
    feature3Desc:
      "Designed for simplicity — large text, clear icons, one-tap operation.",
    footerText: "SENTINEL — Advanced Healthcare Monitoring",
  },

  ar: {
    appName: "سِنتينيل",
    appTagline: "مراقبة ضغط الدم بالذكاء الاصطناعي",
    heroTitle: "الحارس الموثوق لقلبك",
    heroSub:
      "مراقبة متطورة بالذكاء الاصطناعي تسهر على كبار السن على مدار الساعة، لتمنح العائلات راحة البال.",
    heroPatient: "أنا مريض",
    heroRelative: "أنا قريب",
    navHome: "الرئيسية",
    navPatient: "بوابة المريض",
    navRelative: "بوابة القريب",
    navDashboard: "لوحة التحكم",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    patient: "مريض",
    relative: "قريب",
    patientId: "رقم المريض",
    password: "كلمة المرور",
    signInBtn: "دخول",
    createAccount: "إنشاء الحساب",
    measurementType: "نوع القياس",
    defaultSignal: "نوع الإشارة الافتراضية",
    single: "أحادي",
    dual: "ثنائي",
    tri: "ثلاثي",
    linkedPatientId: "رقم المريض المرتبط",
    relativeName: "اسم القريب",
    relationship: "صلة القرابة",
    relationshipHint: "ابن، ابنة، زوجة…",
    phoneNumber: "رقم الهاتف",
    createRelativeAccount: "إنشاء حساب القريب",
    patientSignIn: "دخول المريض",
    patientSignUp: "تسجيل مريض جديد",
    relativeSignIn: "دخول القريب",
    relativeSignUp: "تسجيل قريب جديد",
    uploadSignal: "رفع الإشارة",
    uploadSignalFile: "رفع ملف الإشارة",
    checkBP: "افحص ضغط دمي",
    checking: "جارٍ التحليل…",
    normal: "طبيعي",
    low: "منخفض",
    high: "مرتفع",
    normalMsg: "ضغط دمك ضمن النطاق الصحي الطبيعي.",
    lowMsg: "ضغط دمك أقل من الطبيعي. يُرجى الراحة وشرب السوائل.",
    highMsg: "ضغط دمك مرتفع. يُرجى التواصل مع طبيبك أو أحد أقاربك فوراً.",
    emergencyContact: "جهة الطوارئ",
    noEmergency: "لا توجد جهة طوارئ مسجلة.",
    callRelative: "اتصل بالقريب الآن",
    bpGuide: "دليل ضغط الدم",
    normalGuide: "نطاق صحي",
    lowGuide: "أقل من الطبيعي",
    highGuide: "أعلى من الطبيعي",
    pleaseUpload: "الإشارة المطلوبة",
    monitoringPatient: "مراقبة المريض",
    downloadReport: "تحميل التقرير",
    recentAlert: "آخر تنبيه",
    noReadings: "لا توجد قراءات متاحة بعد.",
    latestSBP: "آخر SBP",
    latestDBP: "آخر DBP",
    avgSBP: "متوسط SBP",
    avgDBP: "متوسط DBP",
    highestSBP: "أعلى SBP",
    highestDBP: "أعلى DBP",
    bpTrend: "منحنى ضغط الدم",
    trendAnalysis: "تحليل الاتجاه",
    sbpChange: "تغير SBP",
    dbpChange: "تغير DBP",
    warnSBP: "⚠ ارتفاع مفاجئ في ضغط الانقباض",
    warnDBP: "⚠ ارتفاع مفاجئ في ضغط الانبساط",
    safe: "القراءات مستقرة. لا تغييرات مفاجئة.",
    historyTable: "سجل القراءات",
    timestamp: "الوقت",
    sbp: "الانقباضي",
    dbp: "الانبساطي",
    status: "الحالة",
    logout: "تسجيل الخروج",
    feature1Title: "تحليل بالذكاء الاصطناعي",
    feature1Desc: "تحليل إشارات ECG وPPG والتنفس باستخدام التعلم العميق.",
    feature2Title: "تنبيهات فورية",
    feature2Desc:
      "إشعارات لحظية لأفراد الأسرة عند وصول القراءات لمستويات حرجة.",
    feature3Title: "مناسب لكبار السن",
    feature3Desc:
      "مصمم للبساطة — خط كبير، أيقونات واضحة، عملية بلمسة واحدة.",
    footerText: "سِنتينيل — مراقبة رعاية صحية متقدمة",
  },
};

function SentinelLogo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="20"
        cy="20"
        r="19"
        fill="url(#logoGrad)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
      />
      <path
        d="M20 8 L28 13 L28 21 C28 26 24 30 20 32 C16 30 12 26 12 21 L12 13 Z"
        fill="rgba(255,255,255,0.15)"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.5"
      />
      <polyline
        points="13,21 16,21 17.5,17 19,25 20.5,19 22,23 23.5,21 27,21"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="logoGrad"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function HeroIllustration() {
  return (
    <div className="hero-photo-wrap">
      <img
        src={elderlyPatientImg}
        alt="Elderly patient with cardiac monitoring sensors"
        className="hero-photo"
      />
    </div>
  );
}

function StatusIcon({ status }) {
  if (status === "Normal") {
    return (
      <svg viewBox="0 0 80 80" width="80" height="80">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="#dcfce7"
          stroke="#22c55e"
          strokeWidth="3"
        />
        <path
          d="M24 40 L34 50 L56 28"
          stroke="#16a34a"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  }

  if (status === "Low") {
    return (
      <svg viewBox="0 0 80 80" width="80" height="80">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="#fef9c3"
          stroke="#f59e0b"
          strokeWidth="3"
        />
        <path
          d="M40 28 L40 45"
          stroke="#d97706"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="40" cy="53" r="3" fill="#d97706" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 80 80" width="80" height="80">
      <circle
        cx="40"
        cy="40"
        r="36"
        fill="#fee2e2"
        stroke="#ef4444"
        strokeWidth="3"
      />
      <path
        d="M28 28 L52 52 M52 28 L28 52"
        stroke="#dc2626"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function App() {
  const [lang, setLang] = useState("en");
  const [darkMode, setDarkMode] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [userType, setUserType] = useState("patient");
  const [authPage, setAuthPage] = useState("signin");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [loggedUser, setLoggedUser] = useState(null);
  const [loggedRelative, setLoggedRelative] = useState(null);

  const [signupPatientId, setSignupPatientId] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupModality, setSignupModality] = useState("single");
  const [signupSignal, setSignupSignal] = useState("ecg");

  const [signinPatientId, setSigninPatientId] = useState("");
  const [signinPassword, setSigninPassword] = useState("");

  const [relativeSignupPassword, setRelativeSignupPassword] = useState("");
  const [relativeLinkedPatientId, setRelativeLinkedPatientId] = useState("");
  const [relativeName, setRelativeName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phone, setPhone] = useState("");

  const [relativeSigninPatientId, setRelativeSigninPatientId] = useState("");
  const [relativeSigninName, setRelativeSigninName] = useState("");
  const [relativeSigninPassword, setRelativeSigninPassword] = useState("");

  const [signalFile, setSignalFile] = useState(null);

  const [multiSignalFiles, setMultiSignalFiles] = useState({
    ecg: null,
    ppg: null,
    resp: null,
  });

  const [result, setResult] = useState(null);
  const [emergencyContact, setEmergencyContact] = useState(null);

  const [authError, setAuthError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [relativeAlert, setRelativeAlert] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  const [loginOptions, setLoginOptions] = useState({
    patients: [],
    relatives: [],
  });
  const [historyError, setHistoryError] = useState("");

  const t = T[lang];
  const isRTL = lang === "ar";
  const isLoggedIn = loggedUser || loggedRelative;

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
  }, [darkMode, isRTL]);

  useEffect(() => {
    async function loadLoginOptions() {
      try {
        const response = await fetch(`${API_URL}/login-options`);
        const data = await response.json();

        setLoginOptions({
          patients: data.patients || [],
          relatives: data.relatives || [],
        });
      } catch (err) {
        console.log("Failed to load login options:", err);
        setLoginOptions({
          patients: [],
          relatives: [],
        });
      }
    }

    loadLoginOptions();
  }, []);

  function clearErrors() {
    setAuthError("");
    setError("");
    setHistoryError("");
  }

  function getSignupConfig() {
    if (signupModality === "single") return signupSignal;
    if (signupModality === "dual") return "ppg_resp";
    return "ecg_ppg_resp";
  }

  function getRequiredSignals() {
    if (!loggedUser) return [];

    if (loggedUser.modality_type === "single") {
      return [loggedUser.signal_config || "ecg"];
    }

    if (loggedUser.modality_type === "dual") {
      return ["ppg", "resp"];
    }

    if (loggedUser.modality_type === "tri") {
      return ["ecg", "ppg", "resp"];
    }

    return [];
  }

  function updateMultiSignalFile(signalName, file) {
    setMultiSignalFiles(prev => ({
      ...prev,
      [signalName]: file || null,
    }));
  }

  async function signup() {
    setAuthError("");

    if (!signupPatientId || !signupPassword) {
      setAuthError("Please enter Patient ID and password.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("patient_id", signupPatientId);
      formData.append("password", signupPassword);
      formData.append("modality_type", signupModality);
      formData.append("signal_config", getSignupConfig());

      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Sign up failed.");
      }

      setLoggedUser(data);
      setActivePage("patient");
    } catch (err) {
      setAuthError(err.message || "Sign up failed.");
    }
  }

  async function signin() {
    setAuthError("");

    if (!signinPatientId || !signinPassword) {
      setAuthError("Please enter Patient ID and password.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("patient_id", signinPatientId);
      formData.append("password", signinPassword);

      const response = await fetch(`${API_URL}/signin`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Sign in failed.");
      }

      setLoggedUser(data);
      setResult(null);
      setSignalFile(null);
      setMultiSignalFiles({ ecg: null, ppg: null, resp: null });
      setEmergencyContact(null);
      setActivePage("patient");
    } catch (err) {
      setAuthError(err.message || "Sign in failed.");
    }
  }

  async function relativeSignup() {
    setAuthError("");

    if (
      !relativeLinkedPatientId ||
      !relativeName ||
      !relationship ||
      !phone ||
      !relativeSignupPassword
    ) {
      setAuthError("Please fill in all fields.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("patient_id", relativeLinkedPatientId);
      formData.append("relative_name", relativeName);
      formData.append("relationship", relationship);
      formData.append("phone", phone);
      formData.append("password", relativeSignupPassword);

      const response = await fetch(`${API_URL}/relative-signup`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Relative sign up failed.");
      }

      setLoggedRelative(data);
      await loadRelativeData(data.patient_id, data.relative_name);
      setActivePage("relative-dashboard");
    } catch (err) {
      setAuthError(err.message || "Relative sign up failed.");
    }
  }

  async function relativeSignin() {
    setAuthError("");

    let resolvedPatientId = relativeSigninPatientId.trim();
    let resolvedRelativeName = relativeSigninName.trim();

    const matchedRelative = loginOptions.relatives.find(relative => {
      const sameName =
        String(relative.relative_name || "").trim().toLowerCase() ===
        resolvedRelativeName.toLowerCase();

      const samePatient =
        !resolvedPatientId ||
        String(relative.patient_id || "").trim().toLowerCase() ===
          resolvedPatientId.toLowerCase();

      return sameName && samePatient;
    });

    if (matchedRelative) {
      resolvedPatientId = matchedRelative.patient_id;
      resolvedRelativeName = matchedRelative.relative_name;

      setRelativeSigninPatientId(matchedRelative.patient_id);
      setRelativeSigninName(matchedRelative.relative_name);
    }

    if (
      !resolvedPatientId ||
      !resolvedRelativeName ||
      !relativeSigninPassword
    ) {
      setAuthError("Please enter Patient ID, Relative Name and Password.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("patient_id", resolvedPatientId);
      formData.append("relative_name", resolvedRelativeName);
      formData.append("password", relativeSigninPassword);

      const response = await fetch(`${API_URL}/relative-signin`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Relative sign in failed.");
      }

      setLoggedRelative(data);
      await loadRelativeData(data.patient_id, data.relative_name);
      setActivePage("relative-dashboard");
    } catch (err) {
      setAuthError(err.message || "Relative sign in failed.");
    }
  }

  async function loadRelativeData(patientId, relName) {
    setHistoryError("");

    try {
      const alertResponse = await fetch(
        `${API_URL}/relative-alert/${patientId}/${relName}`
      );
      const alertData = await alertResponse.json();
      setRelativeAlert(alertData.alert);

      const historyResponse = await fetch(
        `${API_URL}/relative-history/${patientId}/${relName}`
      );
      const historyJson = await historyResponse.json();
      setHistoryData(historyJson.history || []);
    } catch {
      setHistoryError("Failed to load dashboard data.");
    }
  }

  async function loadEmergencyContact(patientId) {
    try {
      const response = await fetch(`${API_URL}/emergency-contact/${patientId}`);
      const data = await response.json();
      setEmergencyContact(data.contact);
    } catch {
      setEmergencyContact(null);
    }
  }

  function logout() {
    setLoggedUser(null);
    setLoggedRelative(null);
    setResult(null);
    setSignalFile(null);
    setMultiSignalFiles({ ecg: null, ppg: null, resp: null });
    setEmergencyContact(null);
    setError("");
    setAuthError("");
    setHistoryError("");
    setHistoryData([]);
    setRelativeAlert(null);
    setUserType("patient");
    setAuthPage("signin");
    setActivePage("home");
  }

  function callRelative() {
    if (emergencyContact?.phone) {
      window.location.href = `tel:${emergencyContact.phone}`;
    } else {
      alert("Emergency alert: Please contact the patient's relative immediately.");
    }
  }

  function downloadReport() {
    window.print();
  }

  async function analyzeBloodPressure() {
    setError("");
    setResult(null);
    setEmergencyContact(null);

    if (!loggedUser) {
      setError("Please sign in first.");
      return;
    }

    const modalityType = loggedUser.modality_type || "single";
    const requiredSignals = getRequiredSignals();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("patient_id", loggedUser.patient_id);

      let endpoint = `${API_URL}/predict-single`;

      if (modalityType === "single") {
        if (!signalFile) {
          setError("Please upload a signal file.");
          return;
        }

        formData.append("signal_type", loggedUser.signal_config || "ecg");
        formData.append("signal_file", signalFile);
      } else {
        const missingSignals = requiredSignals.filter(
          signalName => !multiSignalFiles[signalName]
        );

        if (missingSignals.length > 0) {
          setError(
            `Please upload: ${missingSignals
              .map(signalName => signalName.toUpperCase())
              .join(", ")}.`
          );
          return;
        }

        endpoint =
          modalityType === "dual"
            ? `${API_URL}/predict-dual`
            : `${API_URL}/predict-tri`;

        requiredSignals.forEach(signalName => {
          formData.append(`${signalName}_file`, multiSignalFiles[signalName]);
        });
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Prediction failed.");
      }

      setResult(data);

      if (data.status === "High") {
        await loadEmergencyContact(loggedUser.patient_id);
      }
    } catch (err) {
      setError(err.message || "Prediction failed.");
    } finally {
      setLoading(false);
    }
  }

  const latestReading =
    historyData.length > 0 ? historyData[historyData.length - 1] : null;

  const previousReading =
    historyData.length > 1 ? historyData[historyData.length - 2] : null;

  const sbpChange =
    latestReading && previousReading ? latestReading.sbp - previousReading.sbp : 0;

  const dbpChange =
    latestReading && previousReading ? latestReading.dbp - previousReading.dbp : 0;

  const avgSBP =
    historyData.length > 0
      ? Math.round(
          historyData.reduce((sum, item) => sum + Number(item.sbp || 0), 0) /
            historyData.length
        )
      : 0;

  const avgDBP =
    historyData.length > 0
      ? Math.round(
          historyData.reduce((sum, item) => sum + Number(item.dbp || 0), 0) /
            historyData.length
        )
      : 0;

  const highestSBP =
    historyData.length > 0
      ? Math.round(Math.max(...historyData.map(item => Number(item.sbp || 0))))
      : 0;

  const highestDBP =
    historyData.length > 0
      ? Math.round(Math.max(...historyData.map(item => Number(item.dbp || 0))))
      : 0;

  function TopNav() {
    return (
      <header className="topnav">
        <div className="topnav-inner">
          <div
            className="topnav-brand"
            onClick={() => {
              if (!isLoggedIn) setActivePage("home");
            }}
          >
            <SentinelLogo size={36} />
            <span className="brand-name">{t.appName}</span>
          </div>

          <nav className="topnav-links">
            {!isLoggedIn && (
              <>
                <button
                  className={`nav-link ${activePage === "home" ? "active" : ""}`}
                  onClick={() => setActivePage("home")}
                >
                  {t.navHome}
                </button>

                <button
                  className={`nav-link ${
                    activePage === "auth" && userType === "patient"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    setUserType("patient");
                    setActivePage("auth");
                    clearErrors();
                  }}
                >
                  {t.navPatient}
                </button>

                <button
                  className={`nav-link ${
                    activePage === "auth" && userType === "relative"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    setUserType("relative");
                    setActivePage("auth");
                    clearErrors();
                  }}
                >
                  {t.navRelative}
                </button>
              </>
            )}

            {loggedUser && (
              <button
                className={`nav-link ${activePage === "patient" ? "active" : ""}`}
                onClick={() => setActivePage("patient")}
              >
                {t.navPatient}
              </button>
            )}

            {loggedRelative && (
              <button
                className={`nav-link ${
                  activePage === "relative-dashboard" ? "active" : ""
                }`}
                onClick={() => setActivePage("relative-dashboard")}
              >
                {t.navDashboard}
              </button>
            )}
          </nav>

          <div className="topnav-controls">
            <button
              className="ctrl-btn"
              onClick={() => setLang(current => (current === "en" ? "ar" : "en"))}
              title="Toggle Language"
            >
              {lang === "en" ? "AR" : "EN"}
            </button>

            <button
              className="ctrl-btn"
              onClick={() => setDarkMode(current => !current)}
              title="Toggle Theme"
            >
              {darkMode ? "☀" : "🌙"}
            </button>

            {isLoggedIn && (
              <button className="logout-btn" onClick={logout}>
                {t.logout}
              </button>
            )}

            <button
              className="hamburger"
              onClick={() => setMobileMenuOpen(open => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu">
            {!isLoggedIn && (
              <>
                <button
                  onClick={() => {
                    setActivePage("home");
                    setMobileMenuOpen(false);
                  }}
                >
                  {t.navHome}
                </button>

                <button
                  onClick={() => {
                    setUserType("patient");
                    setActivePage("auth");
                    setMobileMenuOpen(false);
                    clearErrors();
                  }}
                >
                  {t.navPatient}
                </button>

                <button
                  onClick={() => {
                    setUserType("relative");
                    setActivePage("auth");
                    setMobileMenuOpen(false);
                    clearErrors();
                  }}
                >
                  {t.navRelative}
                </button>
              </>
            )}

            {loggedUser && (
              <button
                onClick={() => {
                  setActivePage("patient");
                  setMobileMenuOpen(false);
                }}
              >
                {t.navPatient}
              </button>
            )}

            {loggedRelative && (
              <button
                onClick={() => {
                  setActivePage("relative-dashboard");
                  setMobileMenuOpen(false);
                }}
              >
                {t.navDashboard}
              </button>
            )}

            {isLoggedIn && <button onClick={logout}>{t.logout}</button>}
          </div>
        )}
      </header>
    );
  }

  function HomePage() {
    return (
      <main className="home-page">
        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot" />
              {t.appTagline}
            </div>

            <h1 className="hero-title">{t.heroTitle}</h1>
            <p className="hero-sub">{t.heroSub}</p>

            <div className="hero-cta">
              <button
                className="cta-primary"
                onClick={() => {
                  setUserType("patient");
                  setActivePage("auth");
                  clearErrors();
                }}
              >
                {t.heroPatient}
              </button>

              <button
                className="cta-secondary"
                onClick={() => {
                  setUserType("relative");
                  setActivePage("auth");
                  clearErrors();
                }}
              >
                {t.heroRelative}
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-glow" />
            <HeroIllustration />
            <div className="hero-pulse-ring" />
            <div className="hero-pulse-ring ring2" />
          </div>
        </section>

        <section className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                  <rect
                    width="32"
                    height="32"
                    rx="8"
                    fill="currentColor"
                    opacity="0.1"
                  />
                  <polyline
                    points="4,16 8,16 10,10 12,22 14,14 16,20 18,13 20,19 22,16 28,16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>{t.feature1Title}</h3>
              <p>{t.feature1Desc}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon--amber">
                <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                  <rect
                    width="32"
                    height="32"
                    rx="8"
                    fill="currentColor"
                    opacity="0.1"
                  />
                  <path
                    d="M16 6 L21 11 H26 V16 L21 21 V26 H16 L11 21 H6 V16 L11 11 Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <circle cx="16" cy="16" r="3" fill="currentColor" />
                </svg>
              </div>
              <h3>{t.feature2Title}</h3>
              <p>{t.feature2Desc}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon--teal">
                <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                  <rect
                    width="32"
                    height="32"
                    rx="8"
                    fill="currentColor"
                    opacity="0.1"
                  />
                  <circle
                    cx="16"
                    cy="12"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M7 26 C7 21 10 18 16 18 C22 18 25 21 25 26"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3>{t.feature3Title}</h3>
              <p>{t.feature3Desc}</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  function AuthPage() {
    return (
      <main className="auth-page">
        <div className="auth-panel">
          <div className="auth-type-tabs">
            <button
              className={`auth-type-tab ${userType === "patient" ? "active" : ""}`}
              onClick={() => {
                setUserType("patient");
                clearErrors();
              }}
            >
              {t.patient}
            </button>

            <button
              className={`auth-type-tab ${userType === "relative" ? "active" : ""}`}
              onClick={() => {
                setUserType("relative");
                clearErrors();
              }}
            >
              {t.relative}
            </button>
          </div>

          <div className="auth-mode-tabs">
            <button
              className={`auth-mode-tab ${authPage === "signin" ? "active" : ""}`}
              onClick={() => {
                setAuthPage("signin");
                clearErrors();
              }}
            >
              {t.signIn}
            </button>

            <button
              className={`auth-mode-tab ${authPage === "signup" ? "active" : ""}`}
              onClick={() => {
                setAuthPage("signup");
                clearErrors();
              }}
            >
              {t.signUp}
            </button>
          </div>

          <div className="auth-form-container">
            {userType === "patient" && authPage === "signin" && (
              <div className="auth-form">
                <h2 className="form-title">{t.patientSignIn}</h2>

                <div className="field-group">
                  <label>{t.patientId}</label>
                  <input
                    type="text"
                    list="patient-login-suggestions"
                    value={signinPatientId}
                    onChange={e => setSigninPatientId(e.target.value)}
                    placeholder="Type or choose Patient ID"
                    autoComplete="off"
                  />
                  <datalist id="patient-login-suggestions">
                    {loginOptions.patients.map(patient => (
                      <option
                        key={patient.patient_id}
                        value={patient.patient_id}
                      />
                    ))}
                  </datalist>
                </div>

                <div className="field-group">
                  <label>{t.password}</label>
                  <input
                    type="password"
                    value={signinPassword}
                    onChange={e => setSigninPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                {authError && (
                  <div className="form-error">
                    <span>⚠</span>
                    {authError}
                  </div>
                )}

                <button className="submit-btn" onClick={signin}>
                  {t.signInBtn}
                </button>
              </div>
            )}

            {userType === "patient" && authPage === "signup" && (
              <div className="auth-form">
                <h2 className="form-title">{t.patientSignUp}</h2>

                <div className="field-group">
                  <label>{t.patientId}</label>
                  <input
                    type="text"
                    value={signupPatientId}
                    onChange={e => setSignupPatientId(e.target.value)}
                    placeholder="e.g. P001"
                  />
                </div>

                <div className="field-group">
                  <label>{t.password}</label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="field-group">
                  <label>{t.measurementType}</label>
                  <div className="seg-control">
                    {["single", "dual", "tri"].map(modality => (
                      <button
                        key={modality}
                        className={`seg-btn ${
                          signupModality === modality ? "active" : ""
                        }`}
                        onClick={() => setSignupModality(modality)}
                      >
                        {modality === "single"
                          ? t.single
                          : modality === "dual"
                          ? t.dual
                          : t.tri}
                      </button>
                    ))}
                  </div>
                </div>

                {signupModality === "single" && (
                  <div className="field-group">
                    <label>{t.defaultSignal}</label>
                    <div className="signal-radio-group">
                      {["ecg", "ppg", "resp"].map(signalName => (
                        <label
                          key={signalName}
                          className={`signal-radio ${
                            signupSignal === signalName ? "active" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            value={signalName}
                            checked={signupSignal === signalName}
                            onChange={e => setSignupSignal(e.target.value)}
                          />
                          {signalName.toUpperCase()}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {signupModality === "dual" && (
                  <div className="field-group">
                    <label>Signal Configuration</label>
                    <div className="config-badge">PPG + RESP</div>
                  </div>
                )}

                {signupModality === "tri" && (
                  <div className="field-group">
                    <label>Signal Configuration</label>
                    <div className="config-badge">ECG + PPG + RESP</div>
                  </div>
                )}

                {authError && (
                  <div className="form-error">
                    <span>⚠</span>
                    {authError}
                  </div>
                )}

                <button className="submit-btn" onClick={signup}>
                  {t.createAccount}
                </button>
              </div>
            )}

            {userType === "relative" && authPage === "signin" && (
              <div className="auth-form">
                <h2 className="form-title">{t.relativeSignIn}</h2>

                <div className="field-group">
                  <label>{t.patientId}</label>
                  <input
                    type="text"
                    list="relative-patient-suggestions"
                    value={relativeSigninPatientId}
                    onChange={e => setRelativeSigninPatientId(e.target.value)}
                    placeholder="Type or choose Patient ID"
                    autoComplete="off"
                  />
                  <datalist id="relative-patient-suggestions">
                    {loginOptions.relatives.map(relative => (
                      <option
                        key={`${relative.patient_id}-${relative.relative_name}-patient`}
                        value={relative.patient_id}
                      />
                    ))}
                  </datalist>
                </div>

                <div className="field-group">
                  <label>{t.relativeName}</label>
                  <input
                    type="text"
                    list="relative-name-suggestions"
                    value={relativeSigninName}
                    onChange={e => {
                      const value = e.target.value;
                      setRelativeSigninName(value);

                      const selected = loginOptions.relatives.find(
                        relative =>
                          String(relative.relative_name || "").trim().toLowerCase() ===
                          value.trim().toLowerCase()
                      );

                      if (selected) {
                        setRelativeSigninPatientId(selected.patient_id);
                      }
                    }}
                    placeholder="Type or choose Relative Name"
                    autoComplete="off"
                  />
                  <datalist id="relative-name-suggestions">
                    {loginOptions.relatives.map(relative => (
                      <option
                        key={`${relative.patient_id}-${relative.relative_name}-name`}
                        value={relative.relative_name}
                      />
                    ))}
                  </datalist>
                </div>

                <div className="field-group">
                  <label>{t.password}</label>
                  <input
                    type="password"
                    value={relativeSigninPassword}
                    onChange={e => setRelativeSigninPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                {authError && (
                  <div className="form-error">
                    <span>⚠</span>
                    {authError}
                  </div>
                )}

                <button className="submit-btn" onClick={relativeSignin}>
                  {t.signInBtn}
                </button>
              </div>
            )}

            {userType === "relative" && authPage === "signup" && (
              <div className="auth-form">
                <h2 className="form-title">{t.relativeSignUp}</h2>

                <div className="field-group">
                  <label>{t.linkedPatientId}</label>
                  <input
                    type="text"
                    value={relativeLinkedPatientId}
                    onChange={e => setRelativeLinkedPatientId(e.target.value)}
                    placeholder="e.g. P001"
                  />
                </div>

                <div className="field-group">
                  <label>{t.relativeName}</label>
                  <input
                    type="text"
                    value={relativeName}
                    onChange={e => setRelativeName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>

                <div className="field-group">
                  <label>{t.relationship}</label>
                  <input
                    type="text"
                    value={relationship}
                    onChange={e => setRelationship(e.target.value)}
                    placeholder={t.relationshipHint}
                  />
                </div>

                <div className="field-group">
                  <label>{t.phoneNumber}</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+20 1XX XXX XXXX"
                  />
                </div>

                <div className="field-group">
                  <label>{t.password}</label>
                  <input
                    type="password"
                    value={relativeSignupPassword}
                    onChange={e => setRelativeSignupPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                {authError && (
                  <div className="form-error">
                    <span>⚠</span>
                    {authError}
                  </div>
                )}

                <button className="submit-btn" onClick={relativeSignup}>
                  {t.createRelativeAccount}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="auth-visual">
          <div className="auth-visual-inner">
            <SentinelLogo size={64} />
            <h2>{t.appName}</h2>
            <p>{t.appTagline}</p>

            <div className="auth-stats">
              <div className="auth-stat">
                <span>ECG</span>
                <small>Signal</small>
              </div>
              <div className="auth-stat">
                <span>PPG</span>
                <small>Signal</small>
              </div>
              <div className="auth-stat">
                <span>AI</span>
                <small>Analysis</small>
              </div>
            </div>

            <div className="auth-ecg-wave">
              <svg viewBox="0 0 200 60" fill="none" width="100%">
                <polyline
                  points="0,30 20,30 28,10 36,50 44,20 52,40 60,30 80,30 88,5 96,55 104,15 112,45 120,30 200,30"
                  stroke="rgba(14,165,233,0.7)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </main>
    );
  }

  function PatientDashboard() {
    const requiredSignals = getRequiredSignals();

    return (
      <main className="patient-page">
        <div className="patient-header">
          <div className="patient-welcome">
            <div className="patient-avatar">
              <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
                <circle cx="20" cy="20" r="20" fill="var(--brand-blue)" />
                <circle cx="20" cy="16" r="7" fill="white" opacity="0.9" />
                <path
                  d="M8 36c0-7 5-11 12-11s12 4 12 11"
                  fill="white"
                  opacity="0.9"
                />
              </svg>
            </div>

            <div>
              <p className="welcome-label">Welcome back</p>
              <h2 className="welcome-name">
                Patient {loggedUser?.patient_id || ""}
              </h2>
            </div>
          </div>
        </div>

        <div className="signal-banner">
          <div className="signal-banner-left">
            <span className="signal-label">{t.pleaseUpload}</span>
            <span className="signal-type-pill">
              {loggedUser?.modality_type === "single"
                ? (loggedUser?.signal_config || "ecg").toUpperCase()
                : requiredSignals.map(s => s.toUpperCase()).join(" + ")}
            </span>
          </div>

          <svg viewBox="0 0 60 30" width="80" height="40" fill="none">
            <polyline
              points="0,15 8,15 12,5 16,25 20,10 24,20 28,15 36,15 40,2 44,28 48,8 52,22 56,15 60,15"
              stroke="var(--brand-blue)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="patient-card">
          <h3 className="card-title">{t.uploadSignal}</h3>

          {loggedUser?.modality_type === "single" ? (
            <div
              className="upload-zone"
              onClick={() => document.getElementById("signal-input")?.click()}
            >
              <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
                <rect
                  width="48"
                  height="48"
                  rx="12"
                  fill="var(--brand-blue)"
                  opacity="0.08"
                />
                <path
                  d="M24 32 V18 M17 25 L24 18 L31 25"
                  stroke="var(--brand-blue)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 36 H32"
                  stroke="var(--brand-blue)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              {signalFile ? (
                <p className="upload-filename">✓ {signalFile.name}</p>
              ) : (
                <p className="upload-hint">
                  {t.uploadSignalFile} <span>.npy</span>
                </p>
              )}

              <input
                id="signal-input"
                type="file"
                accept=".npy"
                style={{ display: "none" }}
                onChange={e => setSignalFile(e.target.files?.[0] || null)}
              />
            </div>
          ) : (
            <div className="multi-upload-grid">
              {requiredSignals.map(signalName => (
                <div
                  key={signalName}
                  className="upload-zone upload-zone--small"
                  onClick={() =>
                    document.getElementById(`${signalName}-input`)?.click()
                  }
                >
                  <strong>{signalName.toUpperCase()}</strong>

                  {multiSignalFiles[signalName] ? (
                    <p className="upload-filename">
                      ✓ {multiSignalFiles[signalName].name}
                    </p>
                  ) : (
                    <p className="upload-hint">
                      Upload {signalName.toUpperCase()} <span>.npy</span>
                    </p>
                  )}

                  <input
                    id={`${signalName}-input`}
                    type="file"
                    accept=".npy"
                    style={{ display: "none" }}
                    onChange={e =>
                      updateMultiSignalFile(
                        signalName,
                        e.target.files?.[0] || null
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="form-error">
              <span>⚠</span>
              {error}
            </div>
          )}

          <button
            className="big-action-btn"
            onClick={analyzeBloodPressure}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" /> {t.checking}
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                  <path
                    d="M12 2L12 22M2 12H22"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.3"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <polyline
                    points="8,12 11,15 16,9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t.checkBP}
              </>
            )}
          </button>
        </div>

        {result && (
          <>
            <div
              className={`result-banner result-banner--${(
                result.status || "normal"
              ).toLowerCase()}`}
            >
              <div className="result-icon">
                <StatusIcon status={result.status} />
              </div>

              <div className="result-content">
                <h2 className="result-status-text">
                  {result.status === "Normal"
                    ? t.normal
                    : result.status === "Low"
                    ? t.low
                    : t.high}
                </h2>

                <p className="result-msg">
                  {result.status === "Normal"
                    ? t.normalMsg
                    : result.status === "Low"
                    ? t.lowMsg
                    : t.highMsg}
                </p>

                <small className="result-time">{result.timestamp}</small>
              </div>
            </div>

            {result.status === "High" && (
              <div className="emergency-card">
                <div className="emergency-header">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <path
                      d="M12 2L2 22H22L12 2Z"
                      stroke="#dc2626"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 10V14M12 17V18"
                      stroke="#dc2626"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {t.emergencyContact}
                </div>

                {emergencyContact ? (
                  <div className="emergency-contact-info">
                    <div className="contact-row">
                      <span className="contact-name">
                        {emergencyContact.name}
                      </span>
                      <span className="contact-rel">
                        {emergencyContact.relationship}
                      </span>
                    </div>
                    <span className="contact-phone">
                      {emergencyContact.phone}
                    </span>
                  </div>
                ) : (
                  <p className="no-contact">{t.noEmergency}</p>
                )}

                <button className="emergency-call-btn" onClick={callRelative}>
                  {t.callRelative}
                </button>
              </div>
            )}

            <div className="patient-card">
              <h3 className="card-title">{t.bpGuide}</h3>

              <div className="guide-row">
                <div className="guide-pill guide-pill--green">
                  {t.normal} — {t.normalGuide}
                </div>

                <div className="guide-pill guide-pill--amber">
                  {t.low} — {t.lowGuide}
                </div>

                <div className="guide-pill guide-pill--red">
                  {t.high} — {t.highGuide}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    );
  }

  function RelativeDashboard() {
    return (
      <main className="relative-page">
        <div className="rel-header">
          <div>
            <p className="rel-monitoring-label">{t.monitoringPatient}</p>
            <h2 className="rel-patient-id">
              {loggedRelative?.patient_id || ""}
            </h2>
          </div>

          <button className="report-btn no-print" onClick={downloadReport}>
            {t.downloadReport}
          </button>
        </div>

        <div className="rel-section-title">{t.recentAlert}</div>

        {!relativeAlert ? (
          <div className="empty-state">
            <p>{t.noReadings}</p>
          </div>
        ) : (
          <div
            className={`alert-banner alert-banner--${(
              relativeAlert.status || "normal"
            ).toLowerCase()}`}
          >
            <div className="alert-banner-icon">
              <StatusIcon status={relativeAlert.status} />
            </div>

            <div className="alert-banner-body">
              <h3>
                {relativeAlert.status === "Normal"
                  ? t.normal
                  : relativeAlert.status === "Low"
                  ? t.low
                  : t.high}
              </h3>

              <div className="alert-readings">
                <span>
                  SBP: <strong>{relativeAlert.sbp} mmHg</strong>
                </span>
                <span>
                  DBP: <strong>{relativeAlert.dbp} mmHg</strong>
                </span>
              </div>

              <small>{relativeAlert.timestamp}</small>
            </div>
          </div>
        )}

        {historyError && (
          <div className="form-error">
            <span>⚠</span>
            {historyError}
          </div>
        )}

        {latestReading && (
          <>
            <div className="rel-section-title">{t.trendAnalysis}</div>

            <div className="stats-grid6">
              {[
                {
                  label: t.latestSBP,
                  val: Math.round(Number(latestReading.sbp || 0)),
                  color: "blue",
                },
                {
                  label: t.latestDBP,
                  val: Math.round(Number(latestReading.dbp || 0)),
                  color: "teal",
                },
                { label: t.avgSBP, val: avgSBP, color: "blue" },
                { label: t.avgDBP, val: avgDBP, color: "teal" },
                { label: t.highestSBP, val: highestSBP, color: "red" },
                { label: t.highestDBP, val: highestDBP, color: "red" },
              ].map(({ label, val, color }) => (
                <div key={label} className={`stat-tile stat-tile--${color}`}>
                  <span className="stat-label">{label}</span>
                  <span className="stat-val">{val}</span>
                  <span className="stat-unit">mmHg</span>
                </div>
              ))}
            </div>

            <div className="rel-section-title">{t.bpTrend}</div>

            <div className="chart-card">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={historyData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />

                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={value => String(value || "").slice(11, 16)}
                    tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  />

                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} />

                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      color: "var(--text)",
                    }}
                    labelFormatter={value => String(value || "").slice(0, 16)}
                  />

                  <Line
                    type="monotone"
                    dataKey="sbp"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#0ea5e9" }}
                    name="SBP"
                  />

                  <Line
                    type="monotone"
                    dataKey="dbp"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#0d9488" }}
                    name="DBP"
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="chart-legend">
                <span className="legend-item">
                  <span
                    className="legend-dot"
                    style={{ background: "#0ea5e9" }}
                  />
                  SBP
                </span>

                <span className="legend-item">
                  <span
                    className="legend-dot"
                    style={{ background: "#0d9488" }}
                  />
                  DBP
                </span>
              </div>
            </div>

            {historyData.length > 1 && (
              <div className="trend-analysis-card">
                <div className="trend-row">
                  <span>{t.sbpChange}</span>
                  <span className={sbpChange > 10 ? "trend-up" : "trend-ok"}>
                    {sbpChange.toFixed(2)} mmHg
                  </span>
                </div>

                <div className="trend-row">
                  <span>{t.dbpChange}</span>
                  <span className={dbpChange > 5 ? "trend-up" : "trend-ok"}>
                    {dbpChange.toFixed(2)} mmHg
                  </span>
                </div>

                {sbpChange > 10 && (
                  <div className="trend-warn">{t.warnSBP}</div>
                )}

                {dbpChange > 5 && (
                  <div className="trend-warn">{t.warnDBP}</div>
                )}

                {sbpChange <= 10 && dbpChange <= 5 && (
                  <div className="trend-safe">{t.safe}</div>
                )}
              </div>
            )}

            <div className="rel-section-title">{t.historyTable}</div>

            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>{t.timestamp}</th>
                    <th>{t.sbp}</th>
                    <th>{t.dbp}</th>
                    <th>{t.status}</th>
                  </tr>
                </thead>

                <tbody>
                  {historyData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.timestamp}</td>
                      <td>
                        <strong>{Math.round(Number(item.sbp || 0))}</strong>
                      </td>
                      <td>
                        <strong>{Math.round(Number(item.dbp || 0))}</strong>
                      </td>
                      <td>
                        <span
                          className={`status-pill status-pill--${(
                            item.status || "normal"
                          ).toLowerCase()}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    );
  }

  return (
    <div className="app-shell">
      {TopNav()}

      <div className="page-content">
        {activePage === "home" && !isLoggedIn && HomePage()}
        {activePage === "auth" && !isLoggedIn && AuthPage()}
        {activePage === "patient" && loggedUser && PatientDashboard()}
        {activePage === "relative-dashboard" && loggedRelative && RelativeDashboard()}

        {!isLoggedIn && activePage !== "home" && activePage !== "auth" && HomePage()}
      </div>

      <footer className="app-footer no-print">
        <div className="footer-inner">
          <div className="footer-brand">
            <SentinelLogo size={24} />
            <span>{t.footerText}</span>
          </div>

          <span className="footer-copy">© 2026 SENTINEL</span>
        </div>
      </footer>
    </div>
  );
}