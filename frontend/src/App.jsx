import { useState, useEffect, useRef } from "react";
import { Home, Code2, BookOpen, Users, Play, RotateCcw, ChevronRight, Check, X, AlertTriangle, Flame, Target, TrendingUp, Star, Clock, Zap, ArrowRight, RefreshCw, Network } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from "recharts";

// ── 디자인 토큰 ──────────────────────────────────
const C = {
  bg:    "#0F1117",
  card:  "#1A1D27",
  card2: "#22263A",
  line:  "#2E3350",
  blue:  "#4F8EF7",
  green: "#34D399",
  coral: "#F87171",
  yellow:"#FBBF24",
  purple:"#A78BFA",
  text:  "#E8EAFF",
  muted: "#6B7280",
  white: "#FFFFFF",
};
const SANS = "'Pretendard','Inter',system-ui,sans-serif";
const MONO = "'JetBrains Mono','Fira Code',monospace";

// ── 목 데이터 ──────────────────────────────────
const WEEKLY = [
  { day: "월", min: 25 }, { day: "화", min: 40 }, { day: "수", min: 15 },
  { day: "목", min: 55 }, { day: "금", min: 30 }, { day: "토", min: 0 }, { day: "일", min: 70 },
];

const COURSES = [
  { id: "py", lang: "Python", color: C.blue,   icon: "🐍", progress: 42, total: 80, badge: "인기" },
  { id: "java", lang: "Java",   color: C.coral,  icon: "☕", progress: 18, total: 60, badge: "" },
  { id: "aice", lang: "AICE Associate", color: C.purple, icon: "🏆", progress: 5, total: 140, badge: "자격증" },
  { id: "sql",  lang: "SQL",    color: C.green,  icon: "🗃️", progress: 0,  total: 50, badge: "신규" },
];

const STUDY_GROUPS = [
  { name: "AICE 합격 스터디", members: 6, today: [true, true, false, true, true, false], topic: "Q9 머신러닝 모델링", streak: 14 },
  { name: "파이썬 마스터즈",  members: 4, today: [true, false, true, true],              topic: "리스트 컴프리헨션",  streak: 7  },
];

// ── 시각화 스텝 데이터 ──────────────────────────
const PY_LESSONS = [
  {
    id: 1, title: "for 루프 시각화", desc: "리스트를 순회하며 합계를 구하는 과정을 단계별로 확인하세요.",
    code: `nums = [3, 7, 2, 9, 5]
total = 0
for n in nums:
    total = total + n
print(total)`,
    steps: [
      { line: 1, vars: { nums: "[3,7,2,9,5]", total: "—", n: "—" }, highlight: [0], out: "" },
      { line: 2, vars: { nums: "[3,7,2,9,5]", total: "0", n: "—" }, highlight: [0], out: "" },
      { line: 3, vars: { nums: "[3,7,2,9,5]", total: "0", n: "3" }, highlight: [0], out: "" },
      { line: 4, vars: { nums: "[3,7,2,9,5]", total: "3", n: "3" }, highlight: [0], out: "" },
      { line: 3, vars: { nums: "[3,7,2,9,5]", total: "3", n: "7" }, highlight: [1], out: "" },
      { line: 4, vars: { nums: "[3,7,2,9,5]", total: "10", n: "7" }, highlight: [1], out: "" },
      { line: 3, vars: { nums: "[3,7,2,9,5]", total: "10", n: "2" }, highlight: [2], out: "" },
      { line: 4, vars: { nums: "[3,7,2,9,5]", total: "12", n: "2" }, highlight: [2], out: "" },
      { line: 3, vars: { nums: "[3,7,2,9,5]", total: "12", n: "9" }, highlight: [3], out: "" },
      { line: 4, vars: { nums: "[3,7,2,9,5]", total: "21", n: "9" }, highlight: [3], out: "" },
      { line: 3, vars: { nums: "[3,7,2,9,5]", total: "21", n: "5" }, highlight: [4], out: "" },
      { line: 4, vars: { nums: "[3,7,2,9,5]", total: "26", n: "5" }, highlight: [4], out: "" },
      { line: 5, vars: { nums: "[3,7,2,9,5]", total: "26", n: "5" }, highlight: [], out: "26" },
    ],
  },
  {
    id: 2, title: "버블 정렬 시각화", desc: "인접한 두 값을 비교해 큰 값을 뒤로 보내는 과정을 애니메이션으로 확인하세요.",
    code: `arr = [5, 3, 8, 1, 9, 2]
for i in range(len(arr)-1):
    for j in range(len(arr)-1-i):
        if arr[j] > arr[j+1]:
            arr[j], arr[j+1] = arr[j+1], arr[j]`,
    sortData: [5, 3, 8, 1, 9, 2],
    isBubble: true,
  },
];

const JAVA_LESSONS = [
  {
    id: 1, title: "배열 순회 시각화",
    code: `int[] nums = {4, 8, 2, 6};
int sum = 0;
for (int n : nums) {
    sum += n;
}
System.out.println(sum);`,
    steps: [
      { line: 1, vars: { "nums[]": "[4,8,2,6]", sum: "—", n: "—" }, out: "" },
      { line: 2, vars: { "nums[]": "[4,8,2,6]", sum: "0", n: "—" }, out: "" },
      { line: 3, vars: { "nums[]": "[4,8,2,6]", sum: "0", n: "4" }, out: "" },
      { line: 4, vars: { "nums[]": "[4,8,2,6]", sum: "4", n: "4" }, out: "" },
      { line: 3, vars: { "nums[]": "[4,8,2,6]", sum: "4", n: "8" }, out: "" },
      { line: 4, vars: { "nums[]": "[4,8,2,6]", sum: "12", n: "8" }, out: "" },
      { line: 3, vars: { "nums[]": "[4,8,2,6]", sum: "12", n: "2" }, out: "" },
      { line: 4, vars: { "nums[]": "[4,8,2,6]", sum: "14", n: "2" }, out: "" },
      { line: 3, vars: { "nums[]": "[4,8,2,6]", sum: "14", n: "6" }, out: "" },
      { line: 4, vars: { "nums[]": "[4,8,2,6]", sum: "20", n: "6" }, out: "" },
      { line: 6, vars: { "nums[]": "[4,8,2,6]", sum: "20", n: "6" }, out: "20" },
    ],
  },
];

// AICE 14문항
const AICE_TEMPLATES = [
  { no:1,  type:"데이터 불러오기·병합",   keywords:["read_json","read_csv","merge"],          code:"df_a = pd.read_json('call_log.json')\ndf_b = pd.read_csv('agent_stat.csv')\ndf = pd.merge(df_a, df_b, how='inner', on='AgentID')" },
  { no:2,  type:"결측치 처리",            keywords:["fillna","mean","mode"],                  code:"df['Duration'].fillna(df['Duration'].mean(), inplace=True)\ndf['Channel'].fillna(df['Channel'].mode()[0], inplace=True)" },
  { no:3,  type:"이상치 탐색",            keywords:["quantile","IQR"],                        code:"Q1, Q3 = df['Duration'].quantile([0.25, 0.75])\nIQR = Q3 - Q1\ndf = df[(df['Duration'] >= Q1-1.5*IQR) & (df['Duration'] <= Q3+1.5*IQR)]" },
  { no:4,  type:"범주형 인코딩",          keywords:["get_dummies"],                           code:"df = pd.get_dummies(df, columns=['Channel'])" },
  { no:5,  type:"시각화 (countplot)",     keywords:["countplot"],                             code:"import seaborn as sns\nsns.countplot(data=df, x='Channel')\nplt.show()" },
  { no:6,  type:"시각화 (jointplot)",     keywords:["jointplot"],                             code:"sns.jointplot(data=df, x='Duration', y='SatisfactionScore')\nplt.show()" },
  { no:7,  type:"상관관계 분석",          keywords:["corr","heatmap"],                        code:"corr = df.select_dtypes('number').corr()\nsns.heatmap(corr, annot=True)" },
  { no:8,  type:"파생변수 생성",          keywords:["to_datetime","dt."],                     code:"df['Weekday'] = pd.to_datetime(df['CallDate']).dt.day_name()\ndf['Hour'] = pd.to_datetime(df['CallDate']).dt.hour" },
  { no:9,  type:"Train/Test 분할",        keywords:["train_test_split","test_size"],          code:"from sklearn.model_selection import train_test_split\nX_train, X_valid, y_train, y_valid = train_test_split(X, y, test_size=0.2, random_state=42)" },
  { no:10, type:"머신러닝 모델링",        keywords:["fit(","Regressor"],                      code:"from sklearn.ensemble import RandomForestRegressor\nmodel = RandomForestRegressor(random_state=42)\nmodel.fit(X_train, y_train)" },
  { no:11, type:"머신러닝 평가",          keywords:["predict(","mean_absolute_error"],        code:"from sklearn.metrics import mean_absolute_error\ny_pred = model.predict(X_valid)\nmae = mean_absolute_error(y_valid, y_pred)" },
  { no:12, type:"딥러닝 모델 설계",       keywords:["Dropout","Dense","compile"],             code:"model = Sequential()\nmodel.add(Dense(128, activation='relu'))\nmodel.add(Dropout(0.2))\nmodel.add(Dense(1))\nmodel.compile(optimizer='adam', loss='mse')" },
  { no:13, type:"딥러닝 학습·시각화",     keywords:["model.fit","history"],                   code:"history = model.fit(X_train, y_train, epochs=30, batch_size=16, validation_data=(X_valid, y_valid))\nplt.plot(history.history['loss'])\nplt.plot(history.history['val_loss'])" },
  { no:14, type:"결과 해석 서술",         keywords:[],                                        code:"# 서술형: 어떤 변수가 SatisfactionScore에 가장 큰 영향을 미쳤는지 분석" },
];

// ── 공통 레이아웃 ────────────────────────────────
function Nav({ tab, setTab, nickname, onLogout }) {
  const items = [
    { key:"home",   icon: Home,    label:"홈"          },
    { key:"code",   icon: Code2,   label:"코딩 학습"  },
    { key:"cert",   icon: BookOpen,label:"자격증"     },
    { key:"arch",   icon: Network, label:"아키텍처"   },
    { key:"study",  icon: Users,   label:"스터디"     },
  ];
  return (
    <div style={{ position:"fixed", left:0, top:0, bottom:0, width:200, background:C.card, borderRight:`1px solid ${C.line}`, display:"flex", flexDirection:"column", padding:"24px 12px", zIndex:10 }}>
      <div onClick={() => setTab("home")} style={{ fontFamily:"'Pretendard',sans-serif", fontWeight:800, fontSize:20, color:C.text, marginBottom:36, paddingLeft:8, cursor:"pointer" }}>
        <span style={{ color:C.blue }}>똑</span>똑
      </div>
      {items.map(({ key, icon: Icon, label }) => {
        const active = tab === key;
        return (
          <button key={key} onClick={() => setTab(key)} style={{
            display:"flex", alignItems:"center", gap:10, padding:"11px 12px", borderRadius:10, border:"none",
            background: active ? C.blue+"22" : "transparent", color: active ? C.blue : C.muted,
            cursor:"pointer", fontFamily:SANS, fontSize:14, fontWeight: active ? 700 : 500,
            marginBottom:4, transition:"all 0.15s",
          }}>
            <Icon size={17} />
            {label}
          </button>
        );
      })}
      <div style={{ marginTop:"auto", padding:"10px 12px", borderRadius:10, background:C.card2 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:C.blue+"44", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:MONO, fontSize:13, color:C.blue, fontWeight:700 }}>
            {nickname?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:SANS, fontSize:12, fontWeight:700, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{nickname}</div>
          </div>
          <button onClick={onLogout} title="로그아웃" style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:2, display:"flex", alignItems:"center" }}>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 로그인 / 회원가입 ────────────────────────────
const API = "http://localhost:8000";

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email:"", password:"", nickname:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const url = mode === "login" ? `${API}/api/auth/login` : `${API}/api/auth/signup`;
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { email: form.email, password: form.password, nickname: form.nickname };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "오류가 발생했습니다"); return; }
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("nickname", data.nickname);
      onAuth(data.nickname);
    } catch {
      setError("서버에 연결할 수 없습니다");
    } finally {
      setLoading(false);
    }
  };

  const input = (placeholder, key, type = "text") => (
    <input
      type={type} placeholder={placeholder} value={form[key]} onChange={set(key)}
      onKeyDown={(e) => e.key === "Enter" && submit()}
      style={{
        width:"100%", padding:"11px 14px", borderRadius:9, border:`1px solid ${C.line}`,
        background:C.card2, color:C.text, fontFamily:SANS, fontSize:13, outline:"none",
        boxSizing:"border-box", marginBottom:10,
      }}
    />
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:360, background:C.card, borderRadius:16, padding:"36px 32px", border:`1px solid ${C.line}` }}>
        <div style={{ fontFamily:SANS, fontWeight:800, fontSize:22, color:C.text, marginBottom:4 }}>
          <span style={{ color:C.blue }}>똑</span>똑
        </div>
        <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom:28 }}>
          {mode === "login" ? "학습을 이어가세요" : "지금 시작하세요"}
        </div>

        <div style={{ display:"flex", gap:8, marginBottom:24 }}>
          {["login","signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
              flex:1, padding:"8px 0", borderRadius:8,
              border:`1px solid ${mode===m ? C.blue : C.line}`,
              background: mode===m ? C.blue+"22" : "transparent",
              color: mode===m ? C.blue : C.muted,
              fontFamily:SANS, fontSize:13, fontWeight:700, cursor:"pointer",
            }}>{m === "login" ? "로그인" : "회원가입"}</button>
          ))}
        </div>

        {mode === "signup" && input("닉네임", "nickname")}
        {input("이메일", "email", "email")}
        {input("비밀번호", "password", "password")}

        {error && (
          <div style={{ fontFamily:SANS, fontSize:12, color:C.coral, marginBottom:10 }}>{error}</div>
        )}

        <button onClick={submit} disabled={loading} style={{
          width:"100%", padding:"12px 0", borderRadius:9, border:"none",
          background: loading ? C.line : C.blue, color:C.white,
          fontFamily:SANS, fontSize:14, fontWeight:700, cursor: loading ? "not-allowed" : "pointer",
        }}>{loading ? "처리 중…" : mode === "login" ? "로그인" : "회원가입"}</button>
      </div>
    </div>
  );
}

// ── 홈 ─────────────────────────────────────────
const COURSE_META = [
  { id: "py",   lang: "Python",           color: C.blue,   icon: "🐍", total: 80,  badge: "인기"   },
  { id: "java", lang: "Java",             color: C.coral,  icon: "☕", total: 60,  badge: ""       },
  { id: "aice", lang: "AICE Associate",   color: C.purple, icon: "🏆", total: 14,  badge: "자격증" },
  { id: "sql",  lang: "SQL",              color: C.green,  icon: "🗃️", total: 50,  badge: "신규"  },
];

function authHeader() {
  return { "Authorization": `Bearer ${localStorage.getItem("token")}` };
}

function HomeScreen({ setTab, nickname }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/dashboard/stats`, { headers: authHeader() })
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const streak   = stats?.streak ?? 0;
  const weekly   = stats?.weekly_minutes ?? 0;
  const solved   = stats?.completed_problems ?? 0;
  const chart    = stats?.weekly_chart ?? [
    { day:"월", min:0 }, { day:"화", min:0 }, { day:"수", min:0 },
    { day:"목", min:0 }, { day:"금", min:0 }, { day:"토", min:0 }, { day:"일", min:0 },
  ];
  const progressMap = Object.fromEntries(
    (stats?.course_progress ?? []).map(cp => [cp.course_id, cp.completed_lessons])
  );
  const courses = COURSE_META.map(c => ({ ...c, progress: progressMap[c.id] ?? 0 }));

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return "좋은 아침이에요 ☀️";
    if (h < 18) return "안녕하세요 👋";
    return "오늘도 수고했어요 🌙";
  };

  return (
    <div style={{ padding:"32px 32px 60px" }}>
      <div style={{ fontFamily:SANS, fontSize:22, fontWeight:800, color:C.text, marginBottom:4 }}>{greet()}</div>
      <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom:28 }}>오늘도 30분만 투자해볼까요?</div>

      {/* 스탯 */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:28 }}>
        {[
          { label:"연속 학습일", value: streak ? `${streak}일` : "-", icon:"🔥", color:C.yellow },
          { label:"이번 주 학습", value: weekly ? `${weekly}분` : "-", icon:"⏱️", color:C.blue },
          { label:"완료 문제", value: solved ? `${solved}개` : "-", icon:"✅", color:C.green },
        ].map((s) => (
          <div key={s.label} style={{ background:C.card, border:`1px solid ${C.line}`, borderRadius:12, padding:"16px 18px" }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontFamily:SANS, fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontFamily:SANS, fontSize:11, color:C.muted, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 주간 활동 */}
      <div style={{ background:C.card, border:`1px solid ${C.line}`, borderRadius:12, padding:"18px 20px", marginBottom:28 }}>
        <div style={{ fontFamily:SANS, fontSize:13, fontWeight:700, color:C.text, marginBottom:14 }}>이번 주 학습 현황</div>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={chart} margin={{ top:0, right:0, left:-30, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
            <XAxis dataKey="day" tick={{ fontFamily:MONO, fontSize:10, fill:C.muted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontFamily:MONO, fontSize:10, fill:C.muted }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background:C.card2, border:`1px solid ${C.line}`, fontFamily:SANS, fontSize:11, color:C.text }} formatter={(v) => [`${v}분`, "학습"]} />
            <Bar dataKey="min" fill={C.blue} radius={[5,5,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 이어서 */}
      <div style={{ fontFamily:SANS, fontSize:13, fontWeight:700, color:C.text, marginBottom:12 }}>이어서 학습하기</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {courses.map((c) => (
          <button key={c.id} onClick={() => setTab(c.id === "aice" ? "cert" : "code")} style={{
            textAlign:"left", padding:"14px 16px", borderRadius:12, border:`1px solid ${C.line}`,
            background:C.card, cursor:"pointer",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <span style={{ fontSize:20 }}>{c.icon}</span>
              {c.badge && <span style={{ fontFamily:MONO, fontSize:9, color:c.color, background:c.color+"22", padding:"2px 6px", borderRadius:4, fontWeight:700 }}>{c.badge}</span>}
            </div>
            <div style={{ fontFamily:SANS, fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>{c.lang}</div>
            <div style={{ height:4, background:C.line, borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${Math.min((c.progress/c.total)*100, 100)}%`, background:c.color, borderRadius:3 }} />
            </div>
            <div style={{ fontFamily:MONO, fontSize:10, color:C.muted, marginTop:5 }}>{c.progress} / {c.total} 완료</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── 코딩 학습 ────────────────────────────────────
function StepVisualizer({ lesson }) {
  const [step, setStep] = useState(0);
  const steps = lesson.steps || [];
  const cur = steps[step] || steps[0];
  const codeLines = lesson.code.split("\n");
  const total = steps.length - 1;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
      {/* 코드 패널 */}
      <div style={{ background:"#0D1117", borderRadius:10, padding:16, border:`1px solid ${C.line}` }}>
        <div style={{ fontFamily:MONO, fontSize:10, color:C.muted, marginBottom:10 }}>코드</div>
        {codeLines.map((line, i) => (
          <div key={i} style={{
            fontFamily:MONO, fontSize:12, lineHeight:"1.8", padding:"0 8px", borderRadius:4,
            background: cur.line === i+1 ? C.blue+"33" : "transparent",
            color: cur.line === i+1 ? C.blue : C.text,
            borderLeft: cur.line === i+1 ? `2px solid ${C.blue}` : "2px solid transparent",
          }}>
            <span style={{ color:C.muted, marginRight:12, userSelect:"none" }}>{i+1}</span>{line}
          </div>
        ))}
      </div>

      {/* 변수 상태 */}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <div style={{ background:C.card2, borderRadius:10, padding:16, border:`1px solid ${C.line}`, flex:1 }}>
          <div style={{ fontFamily:MONO, fontSize:10, color:C.muted, marginBottom:10 }}>변수 상태 · Step {step+1}/{steps.length}</div>
          {cur.vars && Object.entries(cur.vars).map(([k, v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${C.line}` }}>
              <span style={{ fontFamily:MONO, fontSize:12, color:C.purple }}>{k}</span>
              <span style={{ fontFamily:MONO, fontSize:12, color:C.green }}>{v}</span>
            </div>
          ))}
          {/* 리스트 하이라이트 (nums) */}
          {cur.highlight !== undefined && (
            <div style={{ marginTop:12 }}>
              <div style={{ fontFamily:MONO, fontSize:10, color:C.muted, marginBottom:6 }}>배열 포인터</div>
              <div style={{ display:"flex", gap:5 }}>
                {[3,7,2,9,5].map((v, i) => (
                  <div key={i} style={{
                    width:34, height:34, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:MONO, fontSize:13, fontWeight:700,
                    background: cur.highlight.includes(i) ? C.blue+"44" : C.card,
                    border: `1.5px solid ${cur.highlight.includes(i) ? C.blue : C.line}`,
                    color: cur.highlight.includes(i) ? C.blue : C.text,
                  }}>{v}</div>
                ))}
              </div>
            </div>
          )}
          {cur.out && (
            <div style={{ marginTop:12, padding:"9px 12px", background:"#0D1117", borderRadius:7, fontFamily:MONO, fontSize:12, color:C.green }}>
              ▸ 출력: {cur.out}
            </div>
          )}
        </div>

        {/* 컨트롤 */}
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setStep(0)} style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${C.line}`, background:"transparent", color:C.muted, cursor:"pointer" }}>
            <RotateCcw size={14} />
          </button>
          <button disabled={step === 0} onClick={() => setStep(s => s-1)} style={{
            flex:1, padding:"9px 0", borderRadius:8, border:`1px solid ${C.line}`,
            background:"transparent", color: step === 0 ? C.muted : C.text, cursor: step === 0 ? "not-allowed" : "pointer",
            fontFamily:SANS, fontSize:12, fontWeight:600,
          }}>← 이전</button>
          <button disabled={step === total} onClick={() => setStep(s => s+1)} style={{
            flex:1, padding:"9px 0", borderRadius:8, border:"none",
            background: step === total ? C.line : C.blue, color:C.white,
            cursor: step === total ? "not-allowed" : "pointer",
            fontFamily:SANS, fontSize:12, fontWeight:700,
          }}>다음 →</button>
        </div>
      </div>
    </div>
  );
}

function BubbleSortVisualizer({ data }) {
  const [arr, setArr] = useState([...data]);
  const [comparing, setComparing] = useState([]);
  const [sorted, setSorted] = useState([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const stepRef = useRef(null);

  const reset = () => { setArr([...data]); setComparing([]); setSorted([]); setDone(false); };

  const run = async () => {
    setRunning(true);
    const a = [...data];
    const n = a.length;
    const sortedIdx = [];
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - 1 - i; j++) {
        setArr([...a]);
        setComparing([j, j + 1]);
        await new Promise(r => setTimeout(r, 450));
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          setArr([...a]);
          await new Promise(r => setTimeout(r, 300));
        }
      }
      sortedIdx.unshift(n - 1 - i);
      setSorted([...sortedIdx]);
    }
    setSorted([...Array(n).keys()]);
    setComparing([]);
    setRunning(false);
    setDone(true);
  };

  const maxV = Math.max(...arr);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:120, marginBottom:16 }}>
        {arr.map((v, i) => (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:C.text }}>{v}</div>
            <div style={{
              width:"100%", height: Math.round((v/maxV)*90),
              borderRadius:"6px 6px 0 0",
              background: sorted.includes(i) ? C.green : comparing.includes(i) ? C.yellow : C.blue,
              transition:"all 0.25s",
            }} />
          </div>
        ))}
      </div>
      {comparing.length > 0 && (
        <div style={{ fontFamily:MONO, fontSize:11, color:C.yellow, marginBottom:10 }}>
          arr[{comparing[0]}]={arr[comparing[0]]} vs arr[{comparing[1]}]={arr[comparing[1]]} 비교 중
        </div>
      )}
      {done && <div style={{ fontFamily:MONO, fontSize:11, color:C.green, marginBottom:10 }}>✅ 정렬 완료!</div>}
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={reset} style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${C.line}`, background:"transparent", color:C.muted, cursor:"pointer" }}><RotateCcw size={14}/></button>
        <button onClick={run} disabled={running} style={{
          flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px 0",
          borderRadius:8, border:"none", background: running ? C.line : C.blue, color:C.white,
          fontFamily:SANS, fontSize:12, fontWeight:700, cursor: running ? "not-allowed" : "pointer",
        }}>
          <Play size={13} /> {running ? "실행 중…" : "애니메이션 실행"}
        </button>
      </div>
    </div>
  );
}

// ── 코딩 학습 데이터 ─────────────────────────────
const LANG_LIST = [
  { id: "python", name: "Python", icon: "🐍", color: C.blue,  available: true  },
  { id: "java",   name: "Java",   icon: "☕", color: C.coral, available: true  },
  { id: "sql",    name: "SQL",    icon: "🗃️", color: C.green, available: false },
];

const CHAPTERS = {
  python: [
    { id: "basics", title: "기초 문법",  icon: "📝", lessons: [PY_LESSONS[0]] },
    { id: "algo",   title: "알고리즘",   icon: "🔄", lessons: [PY_LESSONS[1]] },
  ],
  java: [
    { id: "basics", title: "기초 문법",  icon: "📝", lessons: [JAVA_LESSONS[0]] },
  ],
};

function LangListScreen({ onSelect }) {
  return (
    <div style={{ padding:"32px 32px 60px" }}>
      <div style={{ fontFamily:SANS, fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>코딩 학습</div>
      <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom:28 }}>학습할 언어를 선택하세요</div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {LANG_LIST.map(lang => (
          <button key={lang.id} onClick={() => lang.available && onSelect(lang.id)} style={{
            display:"flex", alignItems:"center", gap:16, padding:"20px 22px",
            borderRadius:14, border:`1px solid ${lang.available ? lang.color+"44" : C.line}`,
            background: lang.available ? lang.color+"0D" : C.card,
            cursor: lang.available ? "pointer" : "not-allowed", textAlign:"left",
          }}>
            <span style={{ fontSize:28 }}>{lang.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:SANS, fontSize:15, fontWeight:700, color: lang.available ? C.text : C.muted }}>{lang.name}</div>
            </div>
            {!lang.available && <span style={{ fontFamily:MONO, fontSize:10, color:C.muted, background:C.card2, padding:"3px 8px", borderRadius:4 }}>준비 중</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChapterListScreen({ langId, onSelect, onBack }) {
  const lang = LANG_LIST.find(l => l.id === langId);
  const chapters = CHAPTERS[langId] || [];
  return (
    <div style={{ padding:"32px 32px 60px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.muted, fontFamily:SANS, fontSize:13, cursor:"pointer", marginBottom:16, padding:0 }}>← 언어 목록</button>
      <div style={{ fontFamily:SANS, fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>{lang?.icon} {lang?.name}</div>
      <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom:28 }}>챕터를 선택하세요</div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {chapters.map(ch => (
          <button key={ch.id} onClick={() => onSelect(ch.id)} style={{
            display:"flex", alignItems:"center", gap:16, padding:"18px 20px",
            borderRadius:12, border:`1px solid ${lang?.color}44`,
            background: lang?.color+"0D", cursor:"pointer", textAlign:"left",
          }}>
            <span style={{ fontSize:22 }}>{ch.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:SANS, fontSize:14, fontWeight:700, color:C.text }}>{ch.title}</div>
              <div style={{ fontFamily:SANS, fontSize:12, color:C.muted, marginTop:2 }}>레슨 {ch.lessons.length}개</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function LessonListScreen({ langId, chapterId, onSelect, onBack }) {
  const lang = LANG_LIST.find(l => l.id === langId);
  const chapter = CHAPTERS[langId]?.find(c => c.id === chapterId);
  return (
    <div style={{ padding:"32px 32px 60px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.muted, fontFamily:SANS, fontSize:13, cursor:"pointer", marginBottom:16, padding:0 }}>← {chapter?.title}</button>
      <div style={{ fontFamily:SANS, fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>{chapter?.icon} {chapter?.title}</div>
      <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom:28 }}>학습할 레슨을 선택하세요</div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {chapter?.lessons.map((lesson, i) => (
          <button key={lesson.id} onClick={() => onSelect(lesson)} style={{
            display:"flex", alignItems:"center", gap:16, padding:"18px 20px",
            borderRadius:12, border:`1px solid ${lang?.color}44`,
            background: lang?.color+"0D", cursor:"pointer", textAlign:"left",
          }}>
            <div style={{ width:32, height:32, borderRadius:8, background: lang?.color+"33", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:MONO, fontSize:13, fontWeight:700, color: lang?.color }}>
              {i + 1}
            </div>
            <div>
              <div style={{ fontFamily:SANS, fontSize:14, fontWeight:700, color:C.text }}>{lesson.title}</div>
              {lesson.desc && <div style={{ fontFamily:SANS, fontSize:12, color:C.muted, marginTop:2 }}>{lesson.desc}</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function LessonViewScreen({ lesson, onBack }) {
  return (
    <div style={{ padding:"32px 32px 60px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.muted, fontFamily:SANS, fontSize:13, cursor:"pointer", marginBottom:16, padding:0 }}>← 레슨 목록</button>
      <div style={{ background:C.card, border:`1px solid ${C.line}`, borderRadius:14, padding:20 }}>
        <div style={{ fontFamily:SANS, fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>{lesson.title}</div>
        <div style={{ fontFamily:SANS, fontSize:12, color:C.muted, marginBottom:16 }}>{lesson.desc || ""}</div>
        {lesson.isBubble
          ? <BubbleSortVisualizer data={lesson.sortData} />
          : <StepVisualizer lesson={lesson} />
        }
      </div>
    </div>
  );
}

function CodeScreen() {
  const [lang, setLang]       = useState(null);
  const [chapter, setChapter] = useState(null);
  const [lesson, setLesson]   = useState(null);

  if (!lang)    return <LangListScreen onSelect={setLang} />;
  if (!chapter) return <ChapterListScreen langId={lang} onSelect={setChapter} onBack={() => setLang(null)} />;
  if (!lesson)  return <LessonListScreen langId={lang} chapterId={chapter} onSelect={setLesson} onBack={() => setChapter(null)} />;
  return <LessonViewScreen lesson={lesson} onBack={() => setLesson(null)} />;
}

// ── 자격증 목록 ──────────────────────────────────
const CERT_LIST = [
  { id: "aice", name: "AICE Associate", icon: "🏆", desc: "AI 역량 검증 자격증 · 14문항", color: C.purple, available: true },
  { id: "sqld", name: "SQLD",           icon: "🗃️", desc: "SQL 개발자 자격증",            color: C.green,  available: false },
  { id: "adsp", name: "ADsP",           icon: "📊", desc: "데이터 분석 준전문가",          color: C.blue,   available: false },
];

function CertListScreen({ onSelect }) {
  return (
    <div style={{ padding:"32px 32px 60px" }}>
      <div style={{ fontFamily:SANS, fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>자격증 모의고사</div>
      <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom:28 }}>응시할 자격증을 선택하세요</div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {CERT_LIST.map(cert => (
          <button key={cert.id} onClick={() => cert.available && onSelect(cert.id)} style={{
            display:"flex", alignItems:"center", gap:16, padding:"20px 22px",
            borderRadius:14, border:`1px solid ${cert.available ? cert.color+"44" : C.line}`,
            background: cert.available ? cert.color+"0D" : C.card,
            cursor: cert.available ? "pointer" : "not-allowed", textAlign:"left",
          }}>
            <span style={{ fontSize:28 }}>{cert.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:SANS, fontSize:15, fontWeight:700, color: cert.available ? C.text : C.muted }}>{cert.name}</div>
              <div style={{ fontFamily:SANS, fontSize:12, color:C.muted, marginTop:3 }}>{cert.desc}</div>
            </div>
            {!cert.available && (
              <span style={{ fontFamily:MONO, fontSize:10, color:C.muted, background:C.card2, padding:"3px 8px", borderRadius:4 }}>준비 중</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── 회차 목록 ────────────────────────────────────
const AICE_EXAMS = [
  { round: 1, label: "1회 모의고사", desc: "2024년 상반기 기출 유형", available: true },
  { round: 2, label: "2회 모의고사", desc: "2024년 하반기 기출 유형", available: false },
  { round: 3, label: "3회 모의고사", desc: "2025년 상반기 기출 유형", available: false },
];

function AiceExamListScreen({ onSelect, onBack }) {
  return (
    <div style={{ padding:"32px 32px 60px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.muted, fontFamily:SANS, fontSize:13, cursor:"pointer", marginBottom:16, padding:0 }}>
        ← 자격증 목록
      </button>
      <div style={{ fontFamily:SANS, fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>AICE Associate</div>
      <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom:28 }}>응시할 회차를 선택하세요</div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {AICE_EXAMS.map(exam => (
          <button key={exam.round} onClick={() => exam.available && onSelect(exam.round)} style={{
            display:"flex", alignItems:"center", gap:16, padding:"18px 20px",
            borderRadius:12, border:`1px solid ${exam.available ? C.purple+"44" : C.line}`,
            background: exam.available ? C.purple+"0D" : C.card,
            cursor: exam.available ? "pointer" : "not-allowed", textAlign:"left",
          }}>
            <div style={{ width:36, height:36, borderRadius:9, background: exam.available ? C.purple+"33" : C.card2, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:MONO, fontSize:13, fontWeight:700, color: exam.available ? C.purple : C.muted, flexShrink:0 }}>
              {exam.round}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:SANS, fontSize:14, fontWeight:700, color: exam.available ? C.text : C.muted }}>{exam.label}</div>
              <div style={{ fontFamily:SANS, fontSize:12, color:C.muted, marginTop:2 }}>{exam.desc}</div>
            </div>
            {!exam.available && (
              <span style={{ fontFamily:MONO, fontSize:10, color:C.muted, background:C.card2, padding:"3px 8px", borderRadius:4 }}>준비 중</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── AICE 모의고사 ─────────────────────────────────
function CertScreen() {
  const [activeCert, setActiveCert] = useState(null);
  const [activeRound, setActiveRound] = useState(null);

  if (!activeCert) return <CertListScreen onSelect={setActiveCert} />;
  if (!activeRound) return <AiceExamListScreen onSelect={setActiveRound} onBack={() => setActiveCert(null)} />;
  return <AiceScreen round={activeRound} onBack={() => setActiveRound(null)} />;
}

function AiceScreen({ round, onBack }) {
  const [selectedQ, setSelectedQ] = useState(null);
  const [draft, setDraft] = useState("");
  const [results, setResults] = useState({});
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState("");

  const grade = async () => {
    if (!selectedQ || !draft.trim()) return;
    setGrading(true);
    setGradeError("");
    try {
      const res = await fetch(`${API}/api/aice/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ question_no: selectedQ.no, code: draft }),
      });
      const data = await res.json();
      if (!res.ok) { setGradeError(data.detail || `서버 오류 (${res.status})`); return; }
      setResults(r => ({ ...r, [selectedQ.no]: { correct: data.is_correct, missing: data.missing_keywords, code: draft } }));
    } catch {
      setGradeError("서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.");
    } finally {
      setGrading(false);
    }
  };

  const attempt = selectedQ ? results[selectedQ.no] : null;
  const correct = Object.values(results).filter(r => r.correct).length;
  const done = Object.keys(results).length;

  return (
    <div style={{ padding:"32px 32px 60px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.muted, fontFamily:SANS, fontSize:13, cursor:"pointer", marginBottom:16, padding:0, display:"flex", alignItems:"center", gap:4 }}>
        ← 회차 목록
      </button>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:22 }}>
        <div>
          <div style={{ fontFamily:SANS, fontSize:20, fontWeight:800, color:C.text, marginBottom:2 }}>AICE Associate 모의고사</div>
          <div style={{ fontFamily:SANS, fontSize:12, color:C.muted }}>14문항 · 실제 시험과 동일한 구성</div>
        </div>
        {done > 0 && (
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:SANS, fontSize:24, fontWeight:800, color: correct/done >= 0.8 ? C.green : C.coral }}>{Math.round((correct/done)*100)}점</div>
            <div style={{ fontFamily:MONO, fontSize:10, color:C.muted }}>{correct}/{done} 정답 · 80점 합격</div>
          </div>
        )}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:14 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          {AICE_TEMPLATES.map((q) => {
            const r = results[q.no];
            return (
              <button key={q.no} onClick={() => { setSelectedQ(q); setDraft(results[q.no]?.code || ""); }} style={{
                display:"flex", alignItems:"center", gap:8, padding:"9px 11px", borderRadius:8,
                border:`1px solid ${selectedQ?.no === q.no ? C.blue : C.line}`,
                background: selectedQ?.no === q.no ? C.blue+"11" : C.card, cursor:"pointer", textAlign:"left",
              }}>
                <span style={{
                  width:20, height:20, borderRadius:5, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:MONO, fontSize:10, fontWeight:700,
                  background: !r ? C.card2 : r.correct ? C.green+"33" : C.coral+"33",
                  color: !r ? C.muted : r.correct ? C.green : C.coral,
                }}>{!r ? q.no : r.correct ? <Check size={11}/> : <X size={11}/>}</span>
                <span style={{ fontFamily:SANS, fontSize:11.5, color:C.text, fontWeight:500 }}>{q.type}</span>
              </button>
            );
          })}
        </div>

        <div style={{ background:C.card, border:`1px solid ${C.line}`, borderRadius:12, padding:20 }}>
          {!selectedQ ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:300, gap:8 }}>
              <BookOpen size={28} color={C.muted} />
              <div style={{ fontFamily:SANS, fontSize:13, color:C.muted }}>왼쪽에서 문항을 선택하세요</div>
            </div>
          ) : (
            <>
              <div style={{ fontFamily:MONO, fontSize:10, color:C.blue, fontWeight:700, marginBottom:6 }}>Q{selectedQ.no}. {selectedQ.type}</div>
              <div style={{ fontFamily:SANS, fontSize:13.5, color:C.text, lineHeight:1.6, marginBottom:14 }}>
                {selectedQ.no === 1 && "call_log.json과 agent_stat.csv를 AgentID 기준 inner merge하여 df에 저장하세요."}
                {selectedQ.no === 2 && "Duration 컬럼은 평균값으로, Channel 컬럼은 최빈값으로 결측치를 대체하세요."}
                {selectedQ.no === 3 && "Duration 컬럼에서 IQR 기준 이상치 행을 탐지하고 제거하세요."}
                {selectedQ.no === 4 && "Channel 컬럼을 원-핫 인코딩하여 df에 반영하세요."}
                {selectedQ.no === 5 && "Seaborn을 사용해 Channel별 건수 분포를 countplot으로 시각화하세요."}
                {selectedQ.no === 6 && "Duration과 SatisfactionScore의 관계를 jointplot으로 시각화하세요."}
                {selectedQ.no === 7 && "수치형 변수 간 상관관계를 계산하고 heatmap으로 시각화하세요."}
                {selectedQ.no === 8 && "CallDate에서 Weekday(요일)와 Hour(시간대) 컬럼을 파생변수로 추출하세요."}
                {selectedQ.no === 9 && "SatisfactionScore를 target으로 하여 8:2 비율로 Train/Test를 분할하세요."}
                {selectedQ.no === 10 && "RandomForestRegressor로 SatisfactionScore 예측 모델을 학습하세요."}
                {selectedQ.no === 11 && "학습한 모델의 예측값을 구하고 MAE로 성능을 평가하세요."}
                {selectedQ.no === 12 && "Hidden layer 2개 이상, Dropout 0.2, 손실함수 MSE로 딥러닝 모델을 설계하세요."}
                {selectedQ.no === 13 && "epochs 30, batch_size 16으로 모델을 학습하고 loss/val_loss 그래프를 비교하세요."}
                {selectedQ.no === 14 && "분석 결과를 바탕으로 SatisfactionScore에 가장 큰 영향을 미친 변수를 1~2문장으로 서술하세요."}
              </div>

              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder={selectedQ.no === 14 ? "분석 결과를 작성하세요…" : "여기에 코드를 작성하세요…"}
                style={{
                  width:"100%", minHeight:100, borderRadius:8, border:`1px solid ${C.line}`,
                  background:"#0D1117", fontFamily:MONO, fontSize:12, color:C.text,
                  padding:12, resize:"vertical", outline:"none", boxSizing:"border-box", lineHeight:1.7,
                }}
              />

              <button onClick={grade} disabled={!draft.trim() || grading} style={{
                marginTop:10, padding:"9px 18px", borderRadius:8, border:"none",
                background: draft.trim() && !grading ? C.blue : C.line, color:C.white,
                fontFamily:SANS, fontSize:12.5, fontWeight:700, cursor: draft.trim() && !grading ? "pointer" : "not-allowed",
              }}>{grading ? "채점 중…" : "제출하고 채점하기"}</button>

              {gradeError && (
                <div style={{ marginTop:10, fontFamily:SANS, fontSize:12, color:C.coral }}>⚠ {gradeError}</div>
              )}

              {attempt && (
                <div style={{ marginTop:16, borderTop:`1px solid ${C.line}`, paddingTop:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, fontFamily:SANS, fontSize:13, fontWeight:700, color: attempt.correct ? C.green : C.coral, marginBottom:10 }}>
                    {attempt.correct ? <Check size={14}/> : <AlertTriangle size={14}/>}
                    {attempt.correct ? "정답입니다!" : "오답입니다 — 모범 답안을 확인하세요"}
                  </div>
                  {!attempt.correct && attempt.missing.length > 0 && (
                    <div style={{ fontFamily:SANS, fontSize:12, color:C.muted, marginBottom:10, background:C.coral+"11", padding:"8px 11px", borderRadius:7 }}>
                      누락된 핵심 키워드: <span style={{ fontFamily:MONO, color:C.coral }}>{attempt.missing.join(", ")}</span>
                    </div>
                  )}
                  <div style={{ fontFamily:MONO, fontSize:10, color:C.muted, marginBottom:6 }}>모범 답안</div>
                  <div style={{ background:"#0D1117", borderRadius:8, padding:14, fontFamily:MONO, fontSize:11.5, color:"#A8D8B0", lineHeight:1.7, whiteSpace:"pre-wrap" }}>
                    {selectedQ.code}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 아키텍처 시각화 ───────────────────────────────
const ARCH_NODES = {
  browser: { label: "브라우저",     icon: "🌐", x: 30,  y: 90,  w: 110, h: 58 },
  storage: { label: "localStorage", icon: "💾", x: 30,  y: 230, w: 110, h: 58 },
  server:  { label: "FastAPI",      icon: "⚡", x: 300, y: 90,  w: 110, h: 58 },
  db:      { label: "MySQL DB",     icon: "🗄️", x: 570, y: 90,  w: 110, h: 58 },
};

const ARCH_STEPS = [
  { from:"browser", to:"server",  label:"① 로그인 요청",        color:C.blue,
    detail:'POST /api/auth/login\n{ "email": "user@example.com", "password": "••••" }' },
  { from:"server",  to:"db",      label:"② 사용자 조회",        color:C.green,
    detail:"SELECT * FROM users WHERE email = 'user@example.com'" },
  { from:"db",      to:"server",  label:"③ 사용자 반환",        color:C.green,
    detail:"User { id: 1, email: '...', password_hash: '$2b$12$...' }" },
  { from:"server",  to:"browser", label:"④ JWT 토큰 발급",      color:C.purple,
    detail:'{ "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abc..." }' },
  { from:"browser", to:"storage", label:"⑤ 토큰 저장",          color:C.yellow,
    detail:"localStorage.setItem('token', 'eyJ...')\n→ 페이지 새로고침해도 유지됨" },
  { from:"browser", to:"server",  label:"⑥ 인증 포함 API 요청", color:C.blue,
    detail:"GET /api/dashboard/stats\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
  { from:"server",  to:"db",      label:"⑦ 사용자 데이터 조회", color:C.green,
    detail:"토큰 서명 검증 → sub(user_id=1) 추출\nSELECT * FROM aice_submissions WHERE user_id = 1" },
  { from:"db",      to:"server",  label:"⑧ 결과 반환",          color:C.green,
    detail:'[{ question_no: 1, is_correct: true }, { question_no: 2, is_correct: false }, ...]' },
  { from:"server",  to:"browser", label:"⑨ 응답 — 홈 화면 업데이트", color:C.blue,
    detail:'{ "streak": 3, "weekly_minutes": 45, "completed_problems": 8 }' },
];

function nc(id) {
  const n = ARCH_NODES[id];
  return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
}

function ArchViewer() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(1);
  const rafRef = useRef(null);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setProgress(0);
    let start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 700, 1);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [step]);

  const cur = ARCH_STEPS[step];
  const from = nc(cur.from);
  const to   = nc(cur.to);
  const px   = from.x + (to.x - from.x) * progress;
  const py   = from.y + (to.y - from.y) * progress;

  return (
    <div style={{ background:C.card, border:`1px solid ${C.line}`, borderRadius:14, padding:20 }}>
      <svg width="100%" viewBox="0 0 710 320" style={{ display:"block" }}>
        {/* 연결선 */}
        <line x1={ARCH_NODES.browser.x+110} y1={119} x2={ARCH_NODES.server.x} y2={119} stroke={C.line} strokeWidth="1.5" strokeDasharray="5 4"/>
        <line x1={ARCH_NODES.server.x+110}  y1={119} x2={ARCH_NODES.db.x}     y2={119} stroke={C.line} strokeWidth="1.5" strokeDasharray="5 4"/>
        <line x1={85} y1={ARCH_NODES.browser.y+58} x2={85} y2={ARCH_NODES.storage.y} stroke={C.line} strokeWidth="1.5" strokeDasharray="5 4"/>

        {/* 노드 */}
        {Object.entries(ARCH_NODES).map(([id, n]) => {
          const active = cur.from === id || cur.to === id;
          return (
            <g key={id}>
              <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={10}
                fill={active ? cur.color+"22" : C.card2}
                stroke={active ? cur.color : C.line} strokeWidth={active ? 2 : 1}/>
              <text x={n.x+n.w/2} y={n.y+24} textAnchor="middle" fontSize={18}>{n.icon}</text>
              <text x={n.x+n.w/2} y={n.y+46} textAnchor="middle" fontSize={10.5} fill={active ? cur.color : C.muted} fontFamily={SANS} fontWeight={active?"700":"500"}>{n.label}</text>
            </g>
          );
        })}

        {/* 패킷 */}
        <circle cx={px} cy={py} r={14} fill={cur.color} opacity={0.15}/>
        <circle cx={px} cy={py} r={7}  fill={cur.color}/>
      </svg>

      <div style={{ background:C.card2, borderRadius:10, padding:"12px 16px", marginTop:12 }}>
        <div style={{ fontFamily:MONO, fontSize:11, color:cur.color, fontWeight:700, marginBottom:6 }}>{cur.label}</div>
        <div style={{ fontFamily:MONO, fontSize:11, color:C.text, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{cur.detail}</div>
      </div>

      <div style={{ display:"flex", gap:8, marginTop:14, alignItems:"center" }}>
        <button onClick={() => setStep(s => Math.max(0,s-1))} disabled={step===0} style={{
          padding:"8px 14px", borderRadius:8, border:`1px solid ${C.line}`,
          background:"transparent", color:step===0?C.muted:C.text,
          fontFamily:SANS, fontSize:12, cursor:step===0?"not-allowed":"pointer",
        }}>← 이전</button>
        <div style={{ flex:1, display:"flex", gap:4 }}>
          {ARCH_STEPS.map((_,i) => (
            <div key={i} onClick={() => setStep(i)} style={{
              flex:1, height:3, borderRadius:2, cursor:"pointer",
              background: i===step ? cur.color : i<step ? cur.color+"55" : C.line,
            }}/>
          ))}
        </div>
        <button onClick={() => setStep(s => Math.min(ARCH_STEPS.length-1,s+1))} disabled={step===ARCH_STEPS.length-1} style={{
          padding:"8px 14px", borderRadius:8, border:"none",
          background:step===ARCH_STEPS.length-1?C.line:C.blue, color:C.white,
          fontFamily:SANS, fontSize:12, cursor:step===ARCH_STEPS.length-1?"not-allowed":"pointer",
        }}>다음 →</button>
      </div>
    </div>
  );
}

const ARCH_DIAGRAMS = [
  { id:"jwt",  title:"JWT 인증 흐름",      desc:"로그인 → 토큰 발급 → API 호출 흐름",   icon:"🔐", available:true  },
  { id:"react",title:"React 렌더링 원리",  desc:"상태 변화 → Virtual DOM → 실제 DOM", icon:"⚛️", available:false },
  { id:"db",   title:"DB 쿼리 최적화",     desc:"인덱스 유무에 따른 조회 흐름 비교",    icon:"🗄️", available:false },
];

function ArchScreen() {
  const [selected, setSelected] = useState(null);

  if (selected === "jwt") return (
    <div style={{ padding:"32px 32px 60px" }}>
      <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:C.muted, fontFamily:SANS, fontSize:13, cursor:"pointer", marginBottom:16, padding:0 }}>← 아키텍처 목록</button>
      <div style={{ fontFamily:SANS, fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>JWT 인증 흐름</div>
      <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom:20 }}>단계별로 토큰이 어디로 이동하는지 확인하세요</div>
      <ArchViewer />
    </div>
  );

  return (
    <div style={{ padding:"32px 32px 60px" }}>
      <div style={{ fontFamily:SANS, fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>아키텍처 시각화</div>
      <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom:28 }}>개발 개념을 애니메이션으로 이해해요</div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {ARCH_DIAGRAMS.map(d => (
          <button key={d.id} onClick={() => d.available && setSelected(d.id)} style={{
            display:"flex", alignItems:"center", gap:16, padding:"20px 22px",
            borderRadius:14, border:`1px solid ${d.available?C.blue+"44":C.line}`,
            background:d.available?C.blue+"0D":C.card,
            cursor:d.available?"pointer":"not-allowed", textAlign:"left",
          }}>
            <span style={{ fontSize:26 }}>{d.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:SANS, fontSize:15, fontWeight:700, color:d.available?C.text:C.muted }}>{d.title}</div>
              <div style={{ fontFamily:SANS, fontSize:12, color:C.muted, marginTop:3 }}>{d.desc}</div>
            </div>
            {!d.available && <span style={{ fontFamily:MONO, fontSize:10, color:C.muted, background:C.card2, padding:"3px 8px", borderRadius:4 }}>준비 중</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── 스터디 그룹 ─────────────────────────────────
function StudyScreen() {
  return (
    <div style={{ padding:"32px 32px 60px" }}>
      <div style={{ fontFamily:SANS, fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>스터디 그룹</div>
      <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom:24 }}>팀원의 오늘 학습 여부를 확인하고 서로 자극받아요</div>

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {STUDY_GROUPS.map((g, gi) => (
          <div key={gi} style={{ background:C.card, border:`1px solid ${C.line}`, borderRadius:14, padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div>
                <div style={{ fontFamily:SANS, fontSize:15, fontWeight:700, color:C.text }}>{g.name}</div>
                <div style={{ fontFamily:MONO, fontSize:11, color:C.muted, marginTop:3 }}>오늘의 주제: {g.topic}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5, fontFamily:MONO, fontSize:12, color:C.yellow }}>
                🔥 {g.streak}일 연속
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {g.today.map((done, i) => (
                <div key={i} style={{
                  width:40, height:40, borderRadius:10,
                  background: done ? C.green+"33" : C.card2,
                  border: `1.5px solid ${done ? C.green : C.line}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:MONO, fontSize:11,
                  color: done ? C.green : C.muted,
                }}>
                  {done ? "✓" : `M${i+1}`}
                </div>
              ))}
            </div>
            <div style={{ marginTop:14, fontFamily:MONO, fontSize:10.5, color:C.muted }}>
              {g.today.filter(Boolean).length}/{g.members}명 오늘 학습 완료
            </div>
          </div>
        ))}

        <button style={{
          padding:"16px", borderRadius:14, border:`1.5px dashed ${C.line}`,
          background:"transparent", color:C.muted, fontFamily:SANS, fontSize:13, fontWeight:600, cursor:"pointer",
        }}>+ 새 스터디 그룹 만들기</button>
      </div>
    </div>
  );
}

// ── 루트 ────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [nickname, setNickname] = useState(() => localStorage.getItem("nickname"));

  const handleAuth = (nick) => setNickname(nick);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nickname");
    setNickname(null);
  };

  if (!nickname) return <AuthScreen onAuth={handleAuth} />;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      <Nav tab={tab} setTab={setTab} nickname={nickname} onLogout={handleLogout} />
      <div style={{ marginLeft:200, flex:1, overflowY:"auto" }}>
        {tab === "home"  && <HomeScreen setTab={setTab} nickname={nickname} />}
        {tab === "code"  && <CodeScreen />}
        {tab === "cert"  && <CertScreen />}
        {tab === "arch"  && <ArchScreen />}
        {tab === "study" && <StudyScreen />}
      </div>
    </div>
  );
}
