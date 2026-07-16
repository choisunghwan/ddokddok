import { useState, useEffect, useRef } from "react";
import { Home, Code2, BookOpen, Users, Play, RotateCcw, ChevronRight, Check, X, AlertTriangle, Flame, Target, TrendingUp, Star, Clock, Zap, ArrowRight, RefreshCw, Network, Settings, LogOut } from "lucide-react";
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
  {
    id: 3, title: "조건문 (if / elif / else)",
    desc: "점수에 따라 학점을 결정하는 분기 흐름을 확인하세요.",
    code: `score = 85
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"
print(grade)`,
    steps: [
      { line:1, vars:{ score:"85" }, out:"" },
      { line:2, vars:{ score:"85", "score>=90":"False" }, out:"" },
      { line:4, vars:{ score:"85", "score>=80":"True" }, out:"" },
      { line:5, vars:{ score:"85", grade:'"B"' }, out:"" },
      { line:9, vars:{ score:"85", grade:'"B"' }, out:"B" },
    ],
  },
  {
    id: 4, title: "while 반복문",
    desc: "1부터 5까지 누적 합계를 구하는 while 루프 흐름.",
    code: `n, total = 1, 0
while n <= 5:
    total += n
    n += 1
print(total)`,
    steps: [
      { line:1, vars:{ n:"1", total:"0" }, out:"" },
      { line:2, vars:{ n:"1", total:"0", "n<=5":"True" }, out:"" },
      { line:3, vars:{ n:"1", total:"1" }, out:"" },
      { line:4, vars:{ n:"2", total:"1" }, out:"" },
      { line:2, vars:{ n:"3", total:"3", "n<=5":"True" }, out:"" },
      { line:3, vars:{ n:"3", total:"6" }, out:"" },
      { line:2, vars:{ n:"5", total:"10", "n<=5":"True" }, out:"" },
      { line:3, vars:{ n:"5", total:"15" }, out:"" },
      { line:4, vars:{ n:"6", total:"15" }, out:"" },
      { line:2, vars:{ n:"6", total:"15", "n<=5":"False" }, out:"" },
      { line:5, vars:{ n:"6", total:"15" }, out:"15" },
    ],
  },
  {
    id: 5, title: "함수 정의와 호출",
    desc: "def로 함수를 만들고 인자를 전달하는 과정.",
    code: `def greet(name, lang="ko"):
    if lang == "ko":
        return f"안녕하세요, {name}님"
    return f"Hello, {name}"

msg1 = greet("Alice")
msg2 = greet("Bob", "en")`,
    steps: [
      { line:1, vars:{ "함수 정의":"greet(name, lang='ko')" }, out:"" },
      { line:6, vars:{ name:'"Alice"', lang:'"ko"(기본값)' }, out:"" },
      { line:2, vars:{ name:'"Alice"', lang:'"ko"', "lang=='ko'":"True" }, out:"" },
      { line:3, vars:{ name:'"Alice"', "return":"'안녕하세요, Alice님'" }, out:"" },
      { line:6, vars:{ msg1:'"안녕하세요, Alice님"' }, out:"" },
      { line:7, vars:{ name:'"Bob"', lang:'"en"' }, out:"" },
      { line:2, vars:{ name:'"Bob"', lang:'"en"', "lang=='ko'":"False" }, out:"" },
      { line:4, vars:{ name:'"Bob"', "return":"'Hello, Bob'" }, out:"" },
      { line:7, vars:{ msg1:'"안녕하세요, Alice님"', msg2:'"Hello, Bob"' }, out:"" },
    ],
  },
  {
    id: 6, title: "딕셔너리 (dict)",
    desc: "키-값 쌍 저장·조회·수정·삭제 — 실무 필수 자료구조.",
    code: `person = {"name": "Alice", "age": 30}
person["email"] = "alice@mail.com"
person["age"] = 31
name = person.get("name")
person.pop("email")
keys = list(person.keys())`,
    steps: [
      { line:1, vars:{ person:'{"name":"Alice","age":30}', size:"2" }, out:"" },
      { line:2, vars:{ person:'{"name":"Alice","age":30,"email":"alice@mail.com"}', size:"3" }, out:"" },
      { line:3, vars:{ person:'{"name":"Alice","age":31,"email":"alice@mail.com"}', "age":"30→31" }, out:"" },
      { line:4, vars:{ person:'{"name":"Alice","age":31,...}', name:'"Alice"' }, out:"" },
      { line:5, vars:{ person:'{"name":"Alice","age":31}', "pop":"email 삭제됨", size:"2" }, out:"" },
      { line:6, vars:{ person:'{"name":"Alice","age":31}', keys:'["name","age"]' }, out:"" },
    ],
  },
  {
    id: 7, title: "문자열 메서드",
    desc: "split · join · strip · replace · upper — 데이터 전처리의 기본.",
    code: `s = "  Hello, Python World  "
clean = s.strip()
up = clean.upper()
rep = up.replace("PYTHON", "DATA")
words = rep.split(", ")
joined = " + ".join(words)`,
    steps: [
      { line:1, vars:{ s:'"  Hello, Python World  "' }, out:"" },
      { line:2, vars:{ s:'...', clean:'"Hello, Python World"', "제거":"양쪽 공백" }, out:"" },
      { line:3, vars:{ clean:'"Hello, Python World"', up:'"HELLO, PYTHON WORLD"' }, out:"" },
      { line:4, vars:{ up:'"HELLO, PYTHON WORLD"', rep:'"HELLO, DATA WORLD"' }, out:"" },
      { line:5, vars:{ rep:'"HELLO, DATA WORLD"', words:'["HELLO", "DATA WORLD"]' }, out:"" },
      { line:6, vars:{ words:'["HELLO","DATA WORLD"]', joined:'"HELLO + DATA WORLD"' }, out:"" },
    ],
  },
  {
    id: 8, title: "리스트 컴프리헨션",
    desc: "한 줄로 리스트를 생성하는 Pythonic한 방법.",
    code: `nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens  = [n for n in nums if n % 2 == 0]
squares = [n**2 for n in nums[:5]]
pairs  = [(x, y) for x in [1,2] for y in [3,4]]
total  = sum(evens)`,
    steps: [
      { line:1, vars:{ nums:"[1,2,3,4,5,6,7,8,9,10]", size:"10" }, out:"" },
      { line:2, vars:{ "조건":"n%2==0", evens:"[2,4,6,8,10]", size:"5" }, out:"" },
      { line:3, vars:{ "대상":"nums[:5]=[1,2,3,4,5]", squares:"[1,4,9,16,25]" }, out:"" },
      { line:4, vars:{ "중첩 루프":"x∈[1,2], y∈[3,4]", pairs:"[(1,3),(1,4),(2,3),(2,4)]" }, out:"" },
      { line:5, vars:{ evens:"[2,4,6,8,10]", total:"30" }, out:"" },
    ],
  },
  {
    id: 9, title: "예외 처리 (try / except)",
    desc: "오류가 발생해도 프로그램이 안전하게 실행되는 구조.",
    code: `def safe_div(a, b):
    try:
        result = a / b
        return result
    except ZeroDivisionError:
        print("0으로 나눌 수 없습니다")
        return None
    finally:
        print("계산 시도 완료")

v1 = safe_div(10, 2)
v2 = safe_div(5, 0)`,
    steps: [
      { line:11, vars:{ a:"10", b:"2" }, out:"" },
      { line:3,  vars:{ a:"10", b:"2", result:"5.0" }, out:"" },
      { line:4,  vars:{ result:"5.0" }, out:"" },
      { line:9,  vars:{ "finally":"항상 실행" }, out:"계산 시도 완료" },
      { line:11, vars:{ v1:"5.0" }, out:"" },
      { line:12, vars:{ a:"5", b:"0" }, out:"" },
      { line:3,  vars:{ a:"5", b:"0", "오류":"ZeroDivisionError 발생!" }, out:"" },
      { line:5,  vars:{ "except":"ZeroDivisionError 처리" }, out:"" },
      { line:6,  vars:{ "print":"0으로 나눌 수 없습니다" }, out:"0으로 나눌 수 없습니다" },
      { line:7,  vars:{ "return":"None" }, out:"" },
      { line:9,  vars:{ "finally":"항상 실행" }, out:"계산 시도 완료" },
      { line:12, vars:{ v1:"5.0", v2:"None" }, out:"" },
    ],
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
  {
    id: 2, title: "ArrayList 기초",
    desc: "add · get · remove · size",
    code: `List<String> list = new ArrayList<>();
list.add("사과");
list.add("바나나");
list.add("체리");
String first = list.get(0);
list.remove(1);
int size = list.size();`,
    steps: [
      { line:1, vars:{ list:"[]", size:"0" }, out:"" },
      { line:2, vars:{ list:"[사과]", size:"1" }, out:"" },
      { line:3, vars:{ list:"[사과, 바나나]", size:"2" }, out:"" },
      { line:4, vars:{ list:"[사과, 바나나, 체리]", size:"3" }, out:"" },
      { line:5, vars:{ list:"[사과, 바나나, 체리]", first:"사과" }, out:"" },
      { line:6, vars:{ list:"[사과, 체리]", "remove(1)":"바나나 삭제됨", size:"2" }, out:"" },
      { line:7, vars:{ list:"[사과, 체리]", size:"2" }, out:"" },
    ],
  },
  {
    id: 3, title: "HashMap 기초",
    desc: "put · get · containsKey · 값 수정",
    code: `Map<String, Integer> scores = new HashMap<>();
scores.put("Alice", 90);
scores.put("Bob", 85);
scores.put("Carol", 92);
int a = scores.get("Alice");
scores.put("Bob", 88);
boolean has = scores.containsKey("Dave");`,
    steps: [
      { line:1, vars:{ scores:"{}", size:"0" }, out:"" },
      { line:2, vars:{ scores:"{Alice=90}", size:"1" }, out:"" },
      { line:3, vars:{ scores:"{Alice=90, Bob=85}", size:"2" }, out:"" },
      { line:4, vars:{ scores:"{Alice=90, Bob=85, Carol=92}", size:"3" }, out:"" },
      { line:5, vars:{ scores:"{Alice=90, Bob=85, Carol=92}", a:"90" }, out:"" },
      { line:6, vars:{ scores:"{Alice=90, Bob=88, Carol=92}", "Bob":"85 → 88 (수정)" }, out:"" },
      { line:7, vars:{ scores:"{Alice=90, Bob=88, Carol=92}", has:"false" }, out:"" },
    ],
  },
  {
    id: 4, title: "Map<String, List> 패턴",
    desc: "부서별 직원 목록 — 실무 핵심 구조",
    code: `Map<String, List<String>> dept = new HashMap<>();
dept.put("개발팀", new ArrayList<>());
dept.get("개발팀").add("Alice");
dept.get("개발팀").add("Bob");
dept.put("마케팅", new ArrayList<>());
dept.get("마케팅").add("Carol");
List<String> dev = dept.get("개발팀");`,
    steps: [
      { line:1, vars:{ dept:"{}" }, out:"" },
      { line:2, vars:{ dept:"{개발팀=[]}" }, out:"" },
      { line:3, vars:{ dept:"{개발팀=[Alice]}" }, out:"" },
      { line:4, vars:{ dept:"{개발팀=[Alice, Bob]}" }, out:"" },
      { line:5, vars:{ dept:"{개발팀=[Alice, Bob], 마케팅=[]}" }, out:"" },
      { line:6, vars:{ dept:"{개발팀=[Alice, Bob], 마케팅=[Carol]}" }, out:"" },
      { line:7, vars:{ dept:"{개발팀=[Alice, Bob], 마케팅=[Carol]}", dev:"[Alice, Bob]" }, out:"" },
    ],
  },
  {
    id: 5, title: "List<Map> 패턴",
    desc: "상품·직원 목록 — DB 결과셋과 동일한 구조",
    code: `List<Map<String, Object>> items = new ArrayList<>();
Map<String, Object> p1 = new HashMap<>();
p1.put("name", "노트북");
p1.put("price", 1200000);
items.add(p1);
Map<String, Object> p2 = new HashMap<>();
p2.put("name", "마우스");
p2.put("price", 50000);
items.add(p2);
int cnt = items.size();`,
    steps: [
      { line:1,  vars:{ items:"[]" }, out:"" },
      { line:2,  vars:{ items:"[]", p1:"{}" }, out:"" },
      { line:3,  vars:{ items:"[]", p1:"{name=노트북}" }, out:"" },
      { line:4,  vars:{ items:"[]", p1:"{name=노트북, price=1200000}" }, out:"" },
      { line:5,  vars:{ items:"[{name=노트북, price=1200000}]" }, out:"" },
      { line:6,  vars:{ items:"[{..}]", p2:"{}" }, out:"" },
      { line:7,  vars:{ items:"[{..}]", p2:"{name=마우스}" }, out:"" },
      { line:8,  vars:{ items:"[{..}]", p2:"{name=마우스, price=50000}" }, out:"" },
      { line:9,  vars:{ items:"[{name=노트북,..}, {name=마우스,..}]" }, out:"" },
      { line:10, vars:{ items:"[{..}, {..}]", cnt:"2" }, out:"" },
    ],
  },
  {
    id: 6, title: "Stream API",
    desc: "filter · map · collect — 컬렉션 처리의 핵심",
    code: `List<Integer> nums = List.of(1,2,3,4,5,6,7,8,9,10);
List<Integer> evens = nums.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());
int total = nums.stream()
    .mapToInt(Integer::intValue)
    .sum();`,
    steps: [
      { line:1, vars:{ nums:"[1,2,3,4,5,6,7,8,9,10]", size:"10" }, out:"" },
      { line:2, vars:{ "stream()":"스트림 파이프라인 시작", elements:"[1..10]" }, out:"" },
      { line:3, vars:{ "filter()":"n%2==0 조건 통과", "통과한 값":"[2,4,6,8,10]" }, out:"" },
      { line:4, vars:{ evens:"[2, 4, 6, 8, 10]", size:"5" }, out:"" },
      { line:5, vars:{ "stream()":"새 스트림 생성", elements:"[1..10]" }, out:"" },
      { line:6, vars:{ "mapToInt()":"IntStream으로 변환", "합산 중":"1+2+…+10" }, out:"" },
      { line:7, vars:{ total:"55" }, out:"" },
    ],
  },
];

const SQL_LESSONS = [
  {
    id: 1, title: "SELECT · WHERE · ORDER BY",
    desc: "기본 조회와 필터링·정렬",
    isSql: true,
    code: `SELECT name, age
FROM employees
WHERE age > 30
ORDER BY age DESC;`,
    steps: [
      { line:2, label:"FROM: employees 테이블 전체 5행 로드",
        result:{ columns:["id","name","age","dept"], rows:[[1,"Alice",28,"개발팀"],[2,"Bob",35,"마케팅"],[3,"Carol",32,"개발팀"],[4,"Dave",25,"디자인"],[5,"Eve",41,"개발팀"]] } },
      { line:3, label:"WHERE age > 30: 조건 불만족 행 제거 (3행 남음)",
        result:{ columns:["id","name","age","dept"], rows:[[2,"Bob",35,"마케팅"],[3,"Carol",32,"개발팀"],[5,"Eve",41,"개발팀"]] } },
      { line:4, label:"ORDER BY age DESC: 나이 내림차순 정렬",
        result:{ columns:["id","name","age","dept"], rows:[[5,"Eve",41,"개발팀"],[2,"Bob",35,"마케팅"],[3,"Carol",32,"개발팀"]] } },
      { line:1, label:"SELECT name, age: 지정한 2개 컬럼만 최종 출력",
        result:{ columns:["name","age"], rows:[["Eve",41],["Bob",35],["Carol",32]] } },
    ],
  },
  {
    id: 2, title: "GROUP BY · 집계 함수",
    desc: "COUNT · AVG · SUM 그룹별 집계",
    isSql: true,
    code: `SELECT dept,
       COUNT(*) AS cnt,
       AVG(age)  AS avg_age
FROM employees
GROUP BY dept;`,
    steps: [
      { line:4, label:"FROM: employees 테이블 전체 로드",
        result:{ columns:["id","name","age","dept"], rows:[[1,"Alice",28,"개발팀"],[2,"Bob",35,"마케팅"],[3,"Carol",32,"개발팀"],[4,"Dave",25,"디자인"],[5,"Eve",41,"개발팀"]] } },
      { line:5, label:"GROUP BY dept: 부서별로 행을 묶음",
        result:{ columns:["dept","포함된 행"], rows:[["개발팀","Alice(28), Carol(32), Eve(41)"],["마케팅","Bob(35)"],["디자인","Dave(25)"]] } },
      { line:2, label:"COUNT(*): 각 그룹의 행 수",
        result:{ columns:["dept","cnt"], rows:[["개발팀",3],["마케팅",1],["디자인",1]] } },
      { line:3, label:"AVG(age): 각 그룹의 평균 나이",
        result:{ columns:["dept","cnt","avg_age"], rows:[["개발팀",3,"33.7"],["마케팅",1,"35.0"],["디자인",1,"25.0"]] } },
    ],
  },
  {
    id: 3, title: "INNER JOIN",
    desc: "두 테이블을 키로 결합하기",
    isSql: true,
    code: `SELECT e.name, e.age, d.city
FROM employees e
INNER JOIN departments d
  ON e.dept = d.name
WHERE d.city = '서울';`,
    steps: [
      { line:2, label:"FROM employees: 왼쪽 테이블 (5행)",
        result:{ columns:["id","name","age","dept"], rows:[[1,"Alice",28,"개발팀"],[2,"Bob",35,"마케팅"],[3,"Carol",32,"개발팀"],[4,"Dave",25,"디자인"],[5,"Eve",41,"개발팀"]] } },
      { line:3, label:"INNER JOIN departments: 오른쪽 테이블 (3행)",
        result:{ columns:["name","city"], rows:[["개발팀","서울"],["마케팅","부산"],["디자인","서울"]] } },
      { line:4, label:"ON e.dept = d.name: 부서명 기준으로 행 매칭",
        result:{ columns:["e.name","e.dept","d.city"], rows:[["Alice","개발팀","서울"],["Bob","마케팅","부산"],["Carol","개발팀","서울"],["Dave","디자인","서울"],["Eve","개발팀","서울"]] } },
      { line:5, label:"WHERE d.city='서울': 서울 부서만 필터 (4행)",
        result:{ columns:["e.name","e.dept","d.city"], rows:[["Alice","개발팀","서울"],["Carol","개발팀","서울"],["Dave","디자인","서울"],["Eve","개발팀","서울"]] } },
      { line:1, label:"SELECT e.name, e.age, d.city: 최종 컬럼 선택",
        result:{ columns:["name","age","city"], rows:[["Alice",28,"서울"],["Carol",32,"서울"],["Dave",25,"서울"],["Eve",41,"서울"]] } },
    ],
  },
  {
    id: 4, title: "서브쿼리",
    desc: "쿼리 안에 쿼리 — 평균 이상 직원 찾기",
    isSql: true,
    code: `SELECT name, age
FROM employees
WHERE age > (
    SELECT AVG(age)
    FROM employees
);`,
    steps: [
      { line:4, label:"내부 쿼리 실행: 전체 직원 평균 나이 계산",
        result:{ columns:["AVG(age)"], rows:[["32.2"]] } },
      { line:2, label:"외부 쿼리 FROM: employees 전체 로드",
        result:{ columns:["id","name","age","dept"], rows:[[1,"Alice",28,"개발팀"],[2,"Bob",35,"마케팅"],[3,"Carol",32,"개발팀"],[4,"Dave",25,"디자인"],[5,"Eve",41,"개발팀"]] } },
      { line:3, label:"WHERE age > 32.2: 평균 초과 직원만 필터",
        result:{ columns:["id","name","age","dept"], rows:[[2,"Bob",35,"마케팅"],[5,"Eve",41,"개발팀"]] } },
      { line:1, label:"SELECT name, age: 최종 결과 출력",
        result:{ columns:["name","age"], rows:[["Bob",35],["Eve",41]] } },
    ],
  },
  {
    id: 5, title: "INSERT · UPDATE · DELETE",
    desc: "데이터 삽입·수정·삭제 — DML의 핵심",
    isSql: true,
    code: `INSERT INTO employees (name, age, dept)
VALUES ('Frank', 29, '개발팀');

UPDATE employees
SET age = 30
WHERE name = 'Frank';

DELETE FROM employees
WHERE name = 'Dave';`,
    steps: [
      { line:1, label:"INSERT 전: 현재 employees 테이블 (5행)",
        result:{ columns:["id","name","age","dept"], rows:[[1,"Alice",28,"개발팀"],[2,"Bob",35,"마케팅"],[3,"Carol",32,"개발팀"],[4,"Dave",25,"디자인"],[5,"Eve",41,"개발팀"]] } },
      { line:1, label:"INSERT 후: Frank 추가 (6행)",
        result:{ columns:["id","name","age","dept"], rows:[[1,"Alice",28,"개발팀"],[2,"Bob",35,"마케팅"],[3,"Carol",32,"개발팀"],[4,"Dave",25,"디자인"],[5,"Eve",41,"개발팀"],[6,"Frank",29,"개발팀"]] } },
      { line:4, label:"UPDATE 전: Frank의 age = 29",
        result:{ columns:["id","name","age","dept"], rows:[[6,"Frank",29,"개발팀"]] } },
      { line:4, label:"UPDATE 후: Frank의 age = 30으로 변경",
        result:{ columns:["id","name","age","dept"], rows:[[6,"Frank",30,"개발팀"]] } },
      { line:8, label:"DELETE: Dave (id=4) 행 제거 → 5행만 남음",
        result:{ columns:["id","name","age","dept"], rows:[[1,"Alice",28,"개발팀"],[2,"Bob",35,"마케팅"],[3,"Carol",32,"개발팀"],[5,"Eve",41,"개발팀"],[6,"Frank",30,"개발팀"]] } },
    ],
  },
  {
    id: 6, title: "HAVING 절",
    desc: "GROUP BY 결과에 조건 걸기 — WHERE와의 차이",
    isSql: true,
    code: `SELECT dept, COUNT(*) AS cnt,
       AVG(age) AS avg_age
FROM employees
GROUP BY dept
HAVING COUNT(*) >= 2
ORDER BY cnt DESC;`,
    steps: [
      { line:3, label:"FROM: employees 전체 로드",
        result:{ columns:["id","name","age","dept"], rows:[[1,"Alice",28,"개발팀"],[2,"Bob",35,"마케팅"],[3,"Carol",32,"개발팀"],[4,"Dave",25,"디자인"],[5,"Eve",41,"개발팀"]] } },
      { line:4, label:"GROUP BY dept: 부서별 그룹화",
        result:{ columns:["dept","cnt","avg_age"], rows:[["개발팀",3,"32.3"],["마케팅",1,"35.0"],["디자인",1,"25.0"]] } },
      { line:5, label:"HAVING COUNT(*) >= 2: 2명 이상 부서만 남김",
        result:{ columns:["dept","cnt","avg_age"], rows:[["개발팀",3,"32.3"]] } },
      { line:6, label:"ORDER BY cnt DESC: 인원 많은 순 정렬",
        result:{ columns:["dept","cnt","avg_age"], rows:[["개발팀",3,"32.3"]] } },
    ],
  },
  {
    id: 7, title: "CASE WHEN",
    desc: "조건에 따라 다른 값 출력 — SQL의 if-else",
    isSql: true,
    code: `SELECT name, age,
  CASE
    WHEN age >= 40 THEN '시니어'
    WHEN age >= 30 THEN '미드레벨'
    ELSE '주니어'
  END AS level
FROM employees;`,
    steps: [
      { line:7, label:"FROM: employees 전체 로드",
        result:{ columns:["name","age"], rows:[["Alice",28],["Bob",35],["Carol",32],["Dave",25],["Eve",41]] } },
      { line:2, label:"CASE: age >= 40 조건 검사 (Eve만 해당)",
        result:{ columns:["name","age","level"], rows:[["Alice",28,"—"],["Bob",35,"—"],["Carol",32,"—"],["Dave",25,"—"],["Eve",41,"시니어"]] } },
      { line:4, label:"age >= 30 조건 검사 (Bob, Carol 해당)",
        result:{ columns:["name","age","level"], rows:[["Alice",28,"—"],["Bob",35,"미드레벨"],["Carol",32,"미드레벨"],["Dave",25,"—"],["Eve",41,"시니어"]] } },
      { line:5, label:"ELSE: 나머지 → 주니어 (Alice, Dave)",
        result:{ columns:["name","age","level"], rows:[["Alice",28,"주니어"],["Bob",35,"미드레벨"],["Carol",32,"미드레벨"],["Dave",25,"주니어"],["Eve",41,"시니어"]] } },
    ],
  },
  {
    id: 8, title: "윈도우 함수 (ROW_NUMBER)",
    desc: "부서별 나이 순위 구하기 — 실무 핵심 SQL",
    isSql: true,
    code: `SELECT name, age, dept,
  ROW_NUMBER() OVER (
    PARTITION BY dept
    ORDER BY age DESC
  ) AS rank_in_dept
FROM employees;`,
    steps: [
      { line:6, label:"FROM: employees 전체 로드",
        result:{ columns:["name","age","dept"], rows:[["Alice",28,"개발팀"],["Bob",35,"마케팅"],["Carol",32,"개발팀"],["Dave",25,"디자인"],["Eve",41,"개발팀"]] } },
      { line:3, label:"PARTITION BY dept: 부서별로 분리",
        result:{ columns:["dept","members"], rows:[["개발팀","Alice(28), Carol(32), Eve(41)"],["디자인","Dave(25)"],["마케팅","Bob(35)"]] } },
      { line:4, label:"ORDER BY age DESC: 각 파티션 내 나이 내림차순",
        result:{ columns:["dept","name","age"], rows:[["개발팀","Eve",41],["개발팀","Carol",32],["개발팀","Alice",28],["디자인","Dave",25],["마케팅","Bob",35]] } },
      { line:2, label:"ROW_NUMBER(): 파티션별 순위 부여",
        result:{ columns:["name","age","dept","rank_in_dept"], rows:[["Eve",41,"개발팀",1],["Carol",32,"개발팀",2],["Alice",28,"개발팀",3],["Dave",25,"디자인",1],["Bob",35,"마케팅",1]] } },
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

// AICE 2회 — 이커머스 주문 데이터
const AICE_TEMPLATES_R2 = [
  { no:1,  type:"데이터 불러오기·병합",   keywords:["read_csv","merge"],                      code:"orders = pd.read_csv('orders.csv')\nproducts = pd.read_csv('products.csv')\ndf = pd.merge(orders, products, how='left', on='ProductID')" },
  { no:2,  type:"결측치 처리",            keywords:["fillna","median","mode"],                code:"df['Price'].fillna(df['Price'].median(), inplace=True)\ndf['Category'].fillna(df['Category'].mode()[0], inplace=True)" },
  { no:3,  type:"이상치 탐색",            keywords:["quantile","IQR"],                        code:"Q1, Q3 = df['Price'].quantile([0.25, 0.75])\nIQR = Q3 - Q1\ndf = df[(df['Price'] >= Q1-1.5*IQR) & (df['Price'] <= Q3+1.5*IQR)]" },
  { no:4,  type:"날짜 파생변수",          keywords:["to_datetime","dt.month","dt.weekday"],   code:"df['OrderDate'] = pd.to_datetime(df['OrderDate'])\ndf['Month'] = df['OrderDate'].dt.month\ndf['Weekday'] = df['OrderDate'].dt.weekday" },
  { no:5,  type:"범주형 인코딩",          keywords:["get_dummies"],                           code:"df = pd.get_dummies(df, columns=['Category', 'PaymentMethod'])" },
  { no:6,  type:"시각화 (boxplot)",       keywords:["boxplot"],                               code:"sns.boxplot(data=df, x='Category', y='Price')\nplt.title('카테고리별 가격 분포')\nplt.show()" },
  { no:7,  type:"시각화 (lineplot)",      keywords:["lineplot","groupby"],                    code:"monthly = df.groupby('Month')['Revenue'].sum().reset_index()\nsns.lineplot(data=monthly, x='Month', y='Revenue')\nplt.show()" },
  { no:8,  type:"상관관계 분석",          keywords:["corr","heatmap"],                        code:"corr = df.select_dtypes('number').corr()\nsns.heatmap(corr, annot=True, fmt='.2f')" },
  { no:9,  type:"Train/Test 분할",        keywords:["train_test_split","test_size"],          code:"X = df.drop(['Revenue', 'OrderID'], axis=1)\ny = df['Revenue']\nX_train, X_valid, y_train, y_valid = train_test_split(X, y, test_size=0.2, random_state=42)" },
  { no:10, type:"머신러닝 모델링",        keywords:["fit(","GradientBoosting"],               code:"from sklearn.ensemble import GradientBoostingRegressor\nmodel = GradientBoostingRegressor(n_estimators=100, random_state=42)\nmodel.fit(X_train, y_train)" },
  { no:11, type:"머신러닝 평가",          keywords:["predict(","mean_squared_error","r2_score"], code:"from sklearn.metrics import mean_squared_error, r2_score\ny_pred = model.predict(X_valid)\nmse = mean_squared_error(y_valid, y_pred)\nr2 = r2_score(y_valid, y_pred)" },
  { no:12, type:"딥러닝 모델 설계",       keywords:["BatchNormalization","Dense","compile"],  code:"model = Sequential()\nmodel.add(Dense(256, activation='relu'))\nmodel.add(BatchNormalization())\nmodel.add(Dropout(0.3))\nmodel.add(Dense(1))\nmodel.compile(optimizer='adam', loss='mse', metrics=['mae'])" },
  { no:13, type:"딥러닝 학습·시각화",     keywords:["model.fit","EarlyStopping"],             code:"from tensorflow.keras.callbacks import EarlyStopping\nes = EarlyStopping(patience=5, restore_best_weights=True)\nhistory = model.fit(X_train, y_train, epochs=50, batch_size=32, validation_data=(X_valid, y_valid), callbacks=[es])" },
  { no:14, type:"결과 해석 서술",         keywords:[],                                        code:"# 서술형: 이커머스 매출 예측에서 가장 중요한 특성(feature)은 무엇인지,\n# 그리고 모델 성능을 개선하기 위한 방안을 서술하시오." },
];

// AICE 3회 — 의료·환자 데이터 (재입원 예측)
const AICE_TEMPLATES_R3 = [
  { no:1,  type:"데이터 불러오기·병합",   keywords:["read_csv","merge"],                      code:"patients = pd.read_csv('patients.csv')\ndiagnosis = pd.read_csv('diagnosis.csv')\ndf = pd.merge(patients, diagnosis, how='inner', on='PatientID')" },
  { no:2,  type:"결측치 처리",            keywords:["fillna","median","ffill"],               code:"df['BloodPressure'].fillna(df['BloodPressure'].median(), inplace=True)\ndf['Diagnosis'].fillna(method='ffill', inplace=True)" },
  { no:3,  type:"이상치 탐색",            keywords:["quantile","IQR"],                        code:"Q1, Q3 = df['BloodSugar'].quantile([0.25, 0.75])\nIQR = Q3 - Q1\ndf = df[(df['BloodSugar'] >= Q1-1.5*IQR) & (df['BloodSugar'] <= Q3+1.5*IQR)]" },
  { no:4,  type:"파생변수 생성 (BMI·연령대)", keywords:["cut","BMI"],                         code:"df['BMI'] = df['Weight'] / (df['Height']/100)**2\ndf['AgeGroup'] = pd.cut(df['Age'], bins=[0,30,50,70,100], labels=['청년','중년','장년','노년'])" },
  { no:5,  type:"범주형 인코딩",          keywords:["LabelEncoder","fit_transform"],          code:"from sklearn.preprocessing import LabelEncoder\nle = LabelEncoder()\ndf['Diagnosis_enc'] = le.fit_transform(df['Diagnosis'])\ndf['AgeGroup_enc'] = le.fit_transform(df['AgeGroup'])" },
  { no:6,  type:"시각화 (violinplot)",    keywords:["violinplot"],                            code:"sns.violinplot(data=df, x='AgeGroup', y='BloodSugar', hue='Readmitted')\nplt.title('연령대별 혈당 분포 (재입원 여부)')\nplt.show()" },
  { no:7,  type:"시각화 (scatterplot)",   keywords:["scatterplot"],                           code:"sns.scatterplot(data=df, x='BMI', y='BloodSugar', hue='Readmitted', alpha=0.6)\nplt.title('BMI vs 혈당 (재입원 여부)')\nplt.show()" },
  { no:8,  type:"상관관계 분석",          keywords:["corr","heatmap"],                        code:"corr = df.select_dtypes('number').corr()\nsns.heatmap(corr, annot=True, cmap='coolwarm')" },
  { no:9,  type:"Train/Test 분할 (분류)", keywords:["train_test_split","stratify"],           code:"X = df.drop(['Readmitted','PatientID'], axis=1).select_dtypes('number')\ny = df['Readmitted']\nX_train, X_valid, y_train, y_valid = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)" },
  { no:10, type:"머신러닝 모델링 (분류)", keywords:["fit(","RandomForestClassifier"],         code:"from sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier(n_estimators=100, random_state=42)\nmodel.fit(X_train, y_train)" },
  { no:11, type:"머신러닝 평가",          keywords:["accuracy_score","confusion_matrix"],     code:"from sklearn.metrics import accuracy_score, confusion_matrix, classification_report\ny_pred = model.predict(X_valid)\nprint(accuracy_score(y_valid, y_pred))\nprint(confusion_matrix(y_valid, y_pred))" },
  { no:12, type:"딥러닝 분류 모델",       keywords:["sigmoid","binary_crossentropy"],         code:"model = Sequential()\nmodel.add(Dense(128, activation='relu', input_shape=(X_train.shape[1],)))\nmodel.add(Dropout(0.3))\nmodel.add(Dense(64, activation='relu'))\nmodel.add(Dense(1, activation='sigmoid'))\nmodel.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])" },
  { no:13, type:"딥러닝 학습·ROC 분석",  keywords:["model.fit","roc_auc_score"],             code:"history = model.fit(X_train, y_train, epochs=30, batch_size=16, validation_data=(X_valid, y_valid))\nfrom sklearn.metrics import roc_auc_score\ny_prob = model.predict(X_valid).flatten()\nauc = roc_auc_score(y_valid, y_prob)" },
  { no:14, type:"결과 해석 서술",         keywords:[],                                        code:"# 서술형: 환자 재입원 예측 모델에서 불균형 데이터(재입원 비율이 낮음)를\n# 처리하는 방법과 정확도 외에 AUC를 평가 지표로 사용하는 이유를 서술하시오." },
];

const AICE_ALL = { 1: AICE_TEMPLATES, 2: AICE_TEMPLATES_R2, 3: AICE_TEMPLATES_R3 };

// ── 공통 레이아웃 ────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}

function Nav({ tab, setTab, nickname, onLogout, onSettings, isGuest }) {
  const isMobile = useIsMobile();
  const items = [
    { key:"home",   icon: Home,    label:"홈"        },
    { key:"code",   icon: Code2,   label:"코딩 학습" },
    { key:"cert",   icon: BookOpen,label:"자격증"    },
    { key:"arch",   icon: Network, label:"아키텍처"  },
    { key:"study",  icon: Users,   label:"스터디"    },
  ];

  if (isMobile) return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, background:C.card, borderTop:`1px solid ${C.line}`, display:"flex", zIndex:10 }}>
      {items.map(({ key, icon: Icon, label }) => {
        const active = tab === key;
        const locked = isGuest && key === "study";
        return (
          <button key={key} onClick={() => setTab(key)} style={{
            flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3,
            padding:"10px 0 8px", border:"none", background:"transparent",
            color: locked ? C.muted+"99" : active ? C.blue : C.muted, cursor:"pointer", position:"relative",
          }}>
            <Icon size={20} />
            <span style={{ fontFamily:SANS, fontSize:9, fontWeight:active?700:400 }}>{label}</span>
            {locked && <span style={{ position:"absolute", top:8, right:"calc(50% - 14px)", fontSize:8, color:C.muted }}>🔒</span>}
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={{ position:"fixed", left:0, top:0, bottom:0, width:200, background:C.card, borderRight:`1px solid ${C.line}`, display:"flex", flexDirection:"column", padding:"24px 12px", zIndex:10 }}>
      <div onClick={() => setTab("home")} style={{ fontFamily:"'Pretendard',sans-serif", fontWeight:800, fontSize:20, color:C.text, marginBottom:36, paddingLeft:8, cursor:"pointer" }}>
        <span style={{ color:C.blue }}>Study</span>AI
      </div>
      {items.map(({ key, icon: Icon, label }) => {
        const active = tab === key;
        const locked = isGuest && key === "study";
        return (
          <button key={key} onClick={() => setTab(key)} style={{
            display:"flex", alignItems:"center", gap:10, padding:"11px 12px", borderRadius:10, border:"none",
            background: active ? C.blue+"22" : "transparent",
            color: locked ? C.muted+"88" : active ? C.blue : C.muted,
            cursor:"pointer", fontFamily:SANS, fontSize:14, fontWeight: active ? 700 : 500,
            marginBottom:4, transition:"all 0.15s",
          }}>
            <Icon size={17} />
            <span style={{ flex:1 }}>{label}</span>
            {locked && <span style={{ fontSize:11 }}>🔒</span>}
          </button>
        );
      })}
      <div style={{ marginTop:"auto", padding:"10px 12px", borderRadius:10, background:C.card2 }}>
        {isGuest ? (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:C.muted+"33", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:MONO, fontSize:12, color:C.muted, fontWeight:700 }}>?</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:SANS, fontSize:11, fontWeight:700, color:C.muted }}>게스트</div>
              <div style={{ fontFamily:MONO, fontSize:9, color:C.muted+"88" }}>진도 저장 안 됨</div>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:C.blue+"44", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:MONO, fontSize:13, color:C.blue, fontWeight:700 }}>
              {nickname?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:SANS, fontSize:12, fontWeight:700, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{nickname}</div>
            </div>
            <button onClick={onSettings} title="설정" style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:2, display:"flex", alignItems:"center" }}>
              <Settings size={14} />
            </button>
            <button onClick={onLogout} title="로그아웃" style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:2, display:"flex", alignItems:"center" }}>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 계정 설정 모달 ───────────────────────────────
const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

function SettingsModal({ nickname, onClose, onNicknameChange, onLogout }) {
  const [tab, setTab] = useState("password");
  const [pwForm, setPwForm] = useState({ current:"", next:"", confirm:"" });
  const [nickForm, setNickForm] = useState(nickname || "");
  const [msg, setMsg] = useState({ text:"", ok:true });
  const [loading, setLoading] = useState(false);

  const setPw = k => e => setPwForm(f => ({ ...f, [k]: e.target.value }));

  const changePassword = async () => {
    if (pwForm.next !== pwForm.confirm) { setMsg({ text:"새 비밀번호가 일치하지 않습니다", ok:false }); return; }
    if (pwForm.next.length < 6) { setMsg({ text:"비밀번호는 6자 이상이어야 합니다", ok:false }); return; }
    setLoading(true); setMsg({ text:"", ok:true });
    try {
      const res = await fetch(`${API}/api/auth/password`, {
        method:"PUT", headers:{ "Content-Type":"application/json", ...authHeader() },
        body: JSON.stringify({ current_password: pwForm.current, new_password: pwForm.next }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg({ text: data.detail || "오류가 발생했습니다", ok:false }); return; }
      setMsg({ text:"비밀번호가 변경되었습니다", ok:true });
      setPwForm({ current:"", next:"", confirm:"" });
    } catch { setMsg({ text:"서버에 연결할 수 없습니다", ok:false }); }
    finally { setLoading(false); }
  };

  const changeNickname = async () => {
    if (!nickForm.trim()) { setMsg({ text:"닉네임을 입력하세요", ok:false }); return; }
    setLoading(true); setMsg({ text:"", ok:true });
    try {
      const res = await fetch(`${API}/api/auth/nickname`, {
        method:"PUT", headers:{ "Content-Type":"application/json", ...authHeader() },
        body: JSON.stringify({ nickname: nickForm }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg({ text: data.detail || "오류가 발생했습니다", ok:false }); return; }
      localStorage.setItem("nickname", data.nickname);
      onNicknameChange(data.nickname);
      setMsg({ text:"닉네임이 변경되었습니다", ok:true });
    } catch { setMsg({ text:"서버에 연결할 수 없습니다", ok:false }); }
    finally { setLoading(false); }
  };

  const deleteAccount = async () => {
    if (!window.confirm("정말 탈퇴하시겠습니까?\n모든 학습 데이터가 삭제됩니다.")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/me`, { method:"DELETE", headers: authHeader() });
      if (!res.ok) { setMsg({ text:"탈퇴 처리 중 오류가 발생했습니다", ok:false }); return; }
      localStorage.clear();
      onLogout();
    } catch { setMsg({ text:"서버에 연결할 수 없습니다", ok:false }); }
    finally { setLoading(false); }
  };

  const inp = (placeholder, val, onChange, type="text") => (
    <input type={type} placeholder={placeholder} value={val} onChange={onChange} style={{
      width:"100%", padding:"10px 14px", borderRadius:8, border:`1px solid ${C.line}`,
      background:C.card2, color:C.text, fontFamily:SANS, fontSize:13, outline:"none",
      boxSizing:"border-box", marginBottom:10,
    }}/>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width:360, background:C.card, borderRadius:16, padding:"28px 28px", border:`1px solid ${C.line}` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ fontFamily:SANS, fontSize:16, fontWeight:800, color:C.text }}>계정 설정</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer" }}><X size={18}/></button>
        </div>

        <div style={{ display:"flex", gap:6, marginBottom:20 }}>
          {[["password","비밀번호 변경"],["nickname","닉네임 변경"],["delete","회원탈퇴"]].map(([k,l]) => (
            <button key={k} onClick={() => { setTab(k); setMsg({ text:"", ok:true }); }} style={{
              flex:1, padding:"7px 0", borderRadius:7, border:`1px solid ${tab===k?(k==="delete"?C.coral:C.blue):C.line}`,
              background: tab===k?(k==="delete"?C.coral+"22":C.blue+"22"):"transparent",
              color: tab===k?(k==="delete"?C.coral:C.blue):C.muted,
              fontFamily:SANS, fontSize:11, fontWeight:700, cursor:"pointer",
            }}>{l}</button>
          ))}
        </div>

        {tab === "password" && (<>
          {inp("현재 비밀번호", pwForm.current, setPw("current"), "password")}
          {inp("새 비밀번호", pwForm.next, setPw("next"), "password")}
          {inp("새 비밀번호 확인", pwForm.confirm, setPw("confirm"), "password")}
          <button onClick={changePassword} disabled={loading} style={{ width:"100%", padding:"11px 0", borderRadius:8, border:"none", background:C.blue, color:C.white, fontFamily:SANS, fontSize:13, fontWeight:700, cursor:"pointer" }}>변경하기</button>
        </>)}

        {tab === "nickname" && (<>
          {inp("새 닉네임", nickForm, e => setNickForm(e.target.value))}
          <button onClick={changeNickname} disabled={loading} style={{ width:"100%", padding:"11px 0", borderRadius:8, border:"none", background:C.blue, color:C.white, fontFamily:SANS, fontSize:13, fontWeight:700, cursor:"pointer" }}>변경하기</button>
        </>)}

        {tab === "delete" && (
          <div>
            <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom:16, lineHeight:1.7 }}>
              탈퇴 시 모든 학습 데이터(채점 이력, 학습 기록, 진행률)가 <span style={{ color:C.coral, fontWeight:700 }}>영구 삭제</span>됩니다.
            </div>
            <button onClick={deleteAccount} disabled={loading} style={{ width:"100%", padding:"11px 0", borderRadius:8, border:"none", background:C.coral, color:C.white, fontFamily:SANS, fontSize:13, fontWeight:700, cursor:"pointer" }}>회원탈퇴</button>
          </div>
        )}

        {msg.text && (
          <div style={{ fontFamily:SANS, fontSize:12, color: msg.ok ? C.green : C.coral, marginTop:10 }}>{msg.text}</div>
        )}
      </div>
    </div>
  );
}

// ── 게스트 배너 ─────────────────────────────────
function GuestBanner({ onLogin, onDismiss }) {
  const isMobile = useIsMobile();
  return (
    <div style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      background:"#1a2235", borderBottom:`1px solid ${C.blue}44`,
      padding:isMobile?"7px 12px":"7px 20px",
      display:"flex", alignItems:"center", gap:10,
    }}>
      <span style={{ fontFamily:SANS, fontSize:isMobile?10.5:12, color:C.muted, flex:1, lineHeight:1.4 }}>
        📚 게스트 모드 — 진도 저장 및 스터디 그룹은 로그인 후 이용 가능해요
      </span>
      <button onClick={onLogin} style={{
        padding:"4px 10px", borderRadius:6, border:`1px solid ${C.blue}`,
        background:C.blue+"22", color:C.blue, fontFamily:SANS, fontSize:11, fontWeight:700,
        cursor:"pointer", flexShrink:0, whiteSpace:"nowrap",
      }}>로그인하기</button>
      <button onClick={onDismiss} style={{
        background:"none", border:"none", color:C.muted, cursor:"pointer",
        padding:"2px 4px", flexShrink:0, fontFamily:MONO, fontSize:14, lineHeight:1,
      }}>✕</button>
    </div>
  );
}

// ── 스터디 로그인 유도 모달 ──────────────────────
function StudyLoginModal({ onLogin, onClose }) {
  return (
    <div style={{
      position:"fixed", inset:0, background:"#00000099", zIndex:200,
      display:"flex", alignItems:"center", justifyContent:"center",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background:C.card, borderRadius:16, padding:"28px 24px", maxWidth:320, width:"90%",
        border:`1px solid ${C.line}`,
      }}>
        <div style={{ fontFamily:SANS, fontSize:18, fontWeight:800, color:C.text, marginBottom:8 }}>👥 스터디 그룹</div>
        <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, lineHeight:1.7, marginBottom:22 }}>
          스터디 그룹은 로그인 후 이용 가능해요.<br/>
          로그인하면 그룹 참여·생성·출석 체크인을 할 수 있어요.
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onLogin} style={{
            flex:2, padding:"11px 0", borderRadius:8, border:"none",
            background:C.blue, color:"#fff", fontFamily:SANS, fontSize:13, fontWeight:700, cursor:"pointer",
          }}>로그인하기</button>
          <button onClick={onClose} style={{
            flex:1, padding:"11px 0", borderRadius:8, border:`1px solid ${C.line}`,
            background:"transparent", color:C.muted, fontFamily:SANS, fontSize:13, cursor:"pointer",
          }}>닫기</button>
        </div>
      </div>
    </div>
  );
}

// ── 로그인 / 회원가입 ────────────────────────────

function AuthScreen({ onAuth, onGuest }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: localStorage.getItem("savedEmail") || "", password:"", nickname:"" });
  const [remember, setRemember] = useState(!!localStorage.getItem("savedEmail"));
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
      if (remember) localStorage.setItem("savedEmail", form.email);
      else localStorage.removeItem("savedEmail");
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
          <span style={{ color:C.blue }}>Study</span>AI
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

        {mode === "login" && (
          <label style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, cursor:"pointer" }}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
              style={{ width:15, height:15, accentColor:C.blue, cursor:"pointer" }}/>
            <span style={{ fontFamily:SANS, fontSize:12, color:C.muted }}>아이디 저장</span>
          </label>
        )}

        {error && (
          <div style={{ fontFamily:SANS, fontSize:12, color:C.coral, marginBottom:10 }}>{error}</div>
        )}

        <button onClick={submit} disabled={loading} style={{
          width:"100%", padding:"12px 0", borderRadius:9, border:"none",
          background: loading ? C.line : C.blue, color:C.white,
          fontFamily:SANS, fontSize:14, fontWeight:700, cursor: loading ? "not-allowed" : "pointer",
        }}>{loading ? "처리 중…" : mode === "login" ? "로그인" : "회원가입"}</button>

        <div style={{ marginTop:16, textAlign:"center" }}>
          <button onClick={onGuest} style={{
            background:"none", border:"none", color:C.muted, fontFamily:SANS, fontSize:12,
            cursor:"pointer", textDecoration:"underline", textUnderlineOffset:3,
          }}>로그인 없이 둘러보기 →</button>
        </div>
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

function HomeScreen({ setTab, nickname, onSettings, onLogout, isGuest, onLogin }) {
  const [stats, setStats] = useState(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isGuest) return;
    fetch(`${API}/api/dashboard/stats`, { headers: authHeader() })
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, [isGuest]);

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
      {isMobile && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div>
            <div style={{ fontFamily:"'Pretendard',sans-serif", fontWeight:800, fontSize:18, color:C.text }}>
              <span style={{ color:C.blue }}>Study</span>AI
            </div>
            <div style={{ fontFamily:SANS, fontSize:13, color:C.text, fontWeight:700, marginTop:2 }}>
              {isGuest ? "게스트로 둘러보는 중" : `${nickname}님, ${greet()}`}
            </div>
          </div>
          <div style={{ display:"flex", gap:2 }}>
            {isGuest ? (
              <button onClick={onLogin} style={{ background:C.blue+"22", border:`1px solid ${C.blue}44`, borderRadius:7, color:C.blue, fontFamily:SANS, fontSize:11, fontWeight:700, padding:"6px 10px", cursor:"pointer" }}>로그인</button>
            ) : (<>
              <button onClick={onSettings} title="설정" style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:6, display:"flex", alignItems:"center" }}>
                <Settings size={20} />
              </button>
              <button onClick={onLogout} title="로그아웃" style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:6, display:"flex", alignItems:"center" }}>
                <LogOut size={20} />
              </button>
            </>)}
          </div>
        </div>
      )}
      {!isMobile && <>
        <div style={{ fontFamily:SANS, fontSize:22, fontWeight:800, color:C.text, marginBottom:4 }}>{nickname}님, {greet()}</div>
        <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom:28 }}>오늘도 30분만 투자해볼까요?</div>
      </>}
      {isMobile && <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom:28 }}>오늘도 30분만 투자해볼까요?</div>}

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
  const isMobile = useIsMobile();
  const steps = lesson.steps || [];
  const cur = steps[step] || steps[0];
  const codeLines = lesson.code.split("\n");
  const total = steps.length - 1;

  return (
    <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:14 }}>
      {/* 코드 패널 */}
      <div style={{ background:"#0D1117", borderRadius:10, padding:16, border:`1px solid ${C.line}`, overflowX:"auto" }}>
        <div style={{ fontFamily:MONO, fontSize:10, color:C.muted, marginBottom:10 }}>코드</div>
        {codeLines.map((line, i) => (
          <div key={i} style={{
            fontFamily:MONO, fontSize: isMobile ? 11 : 12, lineHeight:"1.8", padding:"0 8px", borderRadius:4,
            background: cur.line === i+1 ? C.blue+"33" : "transparent",
            color: cur.line === i+1 ? C.blue : C.text,
            borderLeft: cur.line === i+1 ? `2px solid ${C.blue}` : "2px solid transparent",
            whiteSpace: "pre",
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

function SqlVisualizer({ lesson }) {
  const [step, setStep] = useState(0);
  const isMobile = useIsMobile();
  const steps = lesson.steps || [];
  const cur = steps[step];
  const codeLines = lesson.code.split("\n");
  const total = steps.length - 1;

  return (
    <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:14 }}>
      {/* SQL 코드 패널 */}
      <div style={{ background:"#0D1117", borderRadius:10, padding:16, border:`1px solid ${C.line}`, overflowX:"auto" }}>
        <div style={{ fontFamily:MONO, fontSize:10, color:C.muted, marginBottom:10 }}>SQL</div>
        {codeLines.map((line, i) => (
          <div key={i} style={{
            fontFamily:MONO, fontSize:isMobile?11:12, lineHeight:"1.8", padding:"0 8px", borderRadius:4,
            background: cur.line === i+1 ? C.green+"22" : "transparent",
            color: cur.line === i+1 ? C.green : C.text,
            borderLeft: cur.line === i+1 ? `2px solid ${C.green}` : "2px solid transparent",
            whiteSpace:"pre",
          }}>
            <span style={{ color:C.muted, marginRight:12, userSelect:"none" }}>{i+1}</span>{line}
          </div>
        ))}
      </div>

      {/* 결과 테이블 패널 */}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <div style={{ background:C.card2, borderRadius:10, padding:16, border:`1px solid ${C.line}`, flex:1, overflowX:"auto" }}>
          <div style={{ fontFamily:MONO, fontSize:10, color:C.muted, marginBottom:8 }}>결과 · Step {step+1}/{steps.length}</div>
          {cur.label && (
            <div style={{ fontFamily:SANS, fontSize:11, color:C.green, marginBottom:12, padding:"6px 10px", background:C.green+"11", borderRadius:6 }}>
              {cur.label}
            </div>
          )}
          {cur.result && (
            <>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:MONO, fontSize:isMobile?10:11 }}>
                  <thead>
                    <tr>
                      {cur.result.columns.map(col => (
                        <th key={col} style={{ padding:"5px 10px", borderBottom:`1px solid ${C.line}`, color:C.muted, textAlign:"left", fontWeight:700, whiteSpace:"nowrap" }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cur.result.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci} style={{ padding:"5px 10px", borderBottom:`1px solid ${C.line}44`, color:C.text, whiteSpace:"nowrap" }}>{String(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ fontFamily:MONO, fontSize:10, color:C.muted, marginTop:8 }}>{cur.result.rows.length}행 반환</div>
            </>
          )}
        </div>

        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setStep(0)} style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${C.line}`, background:"transparent", color:C.muted, cursor:"pointer" }}>
            <RotateCcw size={14} />
          </button>
          <button disabled={step === 0} onClick={() => setStep(s => s-1)} style={{
            flex:1, padding:"9px 0", borderRadius:8, border:`1px solid ${C.line}`,
            background:"transparent", color: step===0 ? C.muted : C.text, cursor: step===0 ? "not-allowed" : "pointer",
            fontFamily:SANS, fontSize:12, fontWeight:600,
          }}>← 이전</button>
          <button disabled={step === total} onClick={() => setStep(s => s+1)} style={{
            flex:1, padding:"9px 0", borderRadius:8, border:"none",
            background: step===total ? C.line : C.green, color:C.white,
            cursor: step===total ? "not-allowed" : "pointer",
            fontFamily:SANS, fontSize:12, fontWeight:700,
          }}>다음 →</button>
        </div>
      </div>
    </div>
  );
}

// ── 코딩 학습 데이터 ─────────────────────────────
// ── AI 개념 시각화 ────────────────────────────────
const WORD_VECS = {
  "man":      { x:0.80, y:0.12, color:C.blue,   group:"성별" },
  "woman":    { x:0.75, y:0.65, color:C.pink,   group:"성별" },
  "king":     { x:0.20, y:0.15, color:C.yellow, group:"왕족" },
  "queen":    { x:0.15, y:0.72, color:C.coral,  group:"왕족" },
  "son":      { x:0.55, y:0.20, color:C.blue,   group:"가족" },
  "daughter": { x:0.50, y:0.70, color:C.pink,   group:"가족" },
  "cat":      { x:0.30, y:0.45, color:C.green,  group:"동물" },
  "dog":      { x:0.42, y:0.42, color:C.green,  group:"동물" },
};
const ANALOGIES_W2V = [
  { label:"king - man + woman = ?", from:"king", minus:"man", plus:"woman", result:"queen",    color:C.yellow },
  { label:"son - man + woman = ?",  from:"son",  minus:"man", plus:"woman", result:"daughter", color:C.blue   },
];

function Word2VecViz() {
  const [hovered, setHovered] = useState(null);
  const [activeAnalogy, setActiveAnalogy] = useState(null);
  const isMobile = useIsMobile();
  const W = isMobile ? Math.min(typeof window !== "undefined" ? window.innerWidth - 40 : 360, 420) : 420;
  const H = isMobile ? Math.round(W * 0.7) : 300;
  const px = wx => wx * W, py = wy => wy * H;

  return (
    <div>
      <div style={{ fontFamily:SANS, fontSize:12, color:C.muted, marginBottom:10 }}>단어를 2D 공간의 점으로 표현 — 의미가 비슷할수록 가까이 위치해요</div>
      <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
        {ANALOGIES_W2V.map((a,i) => (
          <button key={i} onClick={() => setActiveAnalogy(activeAnalogy?.label === a.label ? null : a)} style={{
            padding:"6px 12px", borderRadius:20, border:`1px solid ${activeAnalogy?.label===a.label ? a.color : C.line}`,
            background: activeAnalogy?.label===a.label ? a.color+"22" : "transparent",
            color: activeAnalogy?.label===a.label ? a.color : C.muted,
            fontFamily:MONO, fontSize:10, cursor:"pointer", fontWeight:600,
          }}>{a.label}</button>
        ))}
      </div>
      <div style={{ position:"relative", width:W, height:H, background:"#0D1117", borderRadius:12, overflow:"hidden", maxWidth:"100%" }}>
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
          {[0.25,0.5,0.75].map(v => (
            <g key={v}>
              <line x1={px(v)} y1={0} x2={px(v)} y2={H} stroke={C.line} strokeWidth="0.5"/>
              <line x1={0} y1={py(v)} x2={W} y2={py(v)} stroke={C.line} strokeWidth="0.5"/>
            </g>
          ))}
          {activeAnalogy && (() => {
            const from=WORD_VECS[activeAnalogy.from], res=WORD_VECS[activeAnalogy.result];
            const x1=px(from.x),y1=py(from.y),x2=px(res.x),y2=py(res.y);
            const angle=Math.atan2(y2-y1,x2-x1), al=10;
            return (
              <g>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={activeAnalogy.color} strokeWidth="1.5" strokeDasharray="5,3"/>
                <polygon points={`${x2},${y2} ${x2-al*Math.cos(angle-0.4)},${y2-al*Math.sin(angle-0.4)} ${x2-al*Math.cos(angle+0.4)},${y2-al*Math.sin(angle+0.4)}`} fill={activeAnalogy.color}/>
              </g>
            );
          })()}
        </svg>
        {Object.entries(WORD_VECS).map(([word,v]) => {
          const isActive = activeAnalogy && [activeAnalogy.from,activeAnalogy.minus,activeAnalogy.plus,activeAnalogy.result].includes(word);
          return (
            <div key={word} onMouseEnter={()=>setHovered(word)} onMouseLeave={()=>setHovered(null)}
              style={{ position:"absolute", left:px(v.x), top:py(v.y), transform:"translate(-50%,-50%)", cursor:"pointer" }}>
              <div style={{ width:hovered===word||isActive?14:10, height:hovered===word||isActive?14:10, borderRadius:"50%", background:v.color, boxShadow:isActive?`0 0 12px ${v.color}`:"none", transition:"all 0.15s" }}/>
              <div style={{ position:"absolute", top:-18, left:"50%", transform:"translateX(-50%)", fontFamily:MONO, fontSize:10, color:v.color, whiteSpace:"nowrap", fontWeight:hovered===word||isActive?700:400 }}>{word}</div>
            </div>
          );
        })}
      </div>
      {activeAnalogy && (
        <div style={{ marginTop:12, padding:"10px 14px", background:C.card2, borderRadius:8, fontFamily:MONO, fontSize:isMobile?10:11.5, color:C.text }}>
          <span style={{ color:C.yellow }}>{activeAnalogy.from}</span>{" − "}
          <span style={{ color:C.coral }}>{activeAnalogy.minus}</span>{" + "}
          <span style={{ color:C.pink }}>{activeAnalogy.plus}</span>{" ≈ "}
          <span style={{ color:C.green, fontWeight:700 }}>{activeAnalogy.result} ✓</span>
          <div style={{ color:C.muted, fontSize:10, marginTop:4 }}>벡터 연산으로 단어 관계를 수학적으로 계산한 결과예요</div>
        </div>
      )}
    </div>
  );
}

const TOKEN_COLORS_AI = [C.blue,C.purple,C.green,C.coral,C.yellow,C.pink,C.blue,C.green,C.purple];
const TOKENIZE_EXAMPLES = [
  { text:'I love machine learning',    tokens:["I","love","machine","learn","##ing"] },
  { text:'ChatGPT는 인공지능입니다',   tokens:["Chat","##G","##PT","는","인공","##지능","##입니다"] },
  { text:'Hello, World! 2024',          tokens:["Hello",",","World","!","2024"] },
];

function TokenizerViz() {
  const [exIdx, setExIdx] = useState(0);
  const [step, setStep] = useState(0);
  const ex = TOKENIZE_EXAMPLES[exIdx];

  useEffect(() => { setStep(0); }, [exIdx]);
  useEffect(() => {
    if (step < ex.tokens.length) {
      const t = setTimeout(() => setStep(s => s+1), 300);
      return () => clearTimeout(t);
    }
  }, [step, ex]);

  return (
    <div>
      <div style={{ fontFamily:SANS, fontSize:12, color:C.muted, marginBottom:10 }}>문장을 AI가 이해할 수 있는 토큰 단위로 쪼개는 과정이에요 (BERT 방식)</div>
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {TOKENIZE_EXAMPLES.map((e,i) => (
          <button key={i} onClick={() => setExIdx(i)} style={{
            padding:"5px 10px", borderRadius:6, border:`1px solid ${exIdx===i?C.blue:C.line}`,
            background: exIdx===i?C.blue+"22":"transparent",
            color: exIdx===i?C.blue:C.muted, fontFamily:MONO, fontSize:10, cursor:"pointer",
          }}>예시 {i+1}</button>
        ))}
        <button onClick={() => setStep(0)} style={{ marginLeft:"auto", padding:"5px 10px", borderRadius:6, border:`1px solid ${C.line}`, background:"transparent", color:C.muted, fontFamily:MONO, fontSize:10, cursor:"pointer" }}>↺ 다시</button>
      </div>
      <div style={{ padding:"12px 14px", background:"#0D1117", borderRadius:8, fontFamily:MONO, fontSize:13, color:C.text, marginBottom:16 }}>"{ex.text}"</div>
      <div style={{ fontFamily:MONO, fontSize:10, color:C.muted, marginBottom:8 }}>토큰화 결과</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, minHeight:44 }}>
        {ex.tokens.map((tok,i) => (
          <div key={i} style={{
            padding:"6px 10px", borderRadius:6,
            background: i<step ? TOKEN_COLORS_AI[i%TOKEN_COLORS_AI.length]+"33" : C.card2,
            border:`1px solid ${i<step?TOKEN_COLORS_AI[i%TOKEN_COLORS_AI.length]:C.line}`,
            color: i<step?TOKEN_COLORS_AI[i%TOKEN_COLORS_AI.length]:C.muted,
            fontFamily:MONO, fontSize:12, fontWeight:700, transition:"all 0.2s",
            transform: i<step?"scale(1)":"scale(0.85)", opacity: i<step?1:0.3,
          }}>
            {tok}<span style={{ fontSize:8, opacity:0.6, marginLeft:4 }}>[{i}]</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
        {[
          { label:"원본 단어 수", value:ex.text.split(" ").length+"개" },
          { label:"토큰 수",      value:ex.tokens.length+"개" },
          { label:"분리된 토큰", value:ex.tokens.filter(t=>t.startsWith("##")).length+"개" },
        ].map(s => (
          <div key={s.label} style={{ background:C.card2, borderRadius:8, padding:"10px 12px", textAlign:"center" }}>
            <div style={{ fontFamily:SANS, fontSize:16, fontWeight:800, color:C.blue }}>{s.value}</div>
            <div style={{ fontFamily:SANS, fontSize:10, color:C.muted, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ATTN_SENTENCE = ["The","cat","sat","on","the","mat"];
const ATTN_WEIGHTS = [
  [0.6,0.2,0.05,0.05,0.05,0.05],
  [0.1,0.5,0.2, 0.05,0.05,0.1 ],
  [0.05,0.3,0.4,0.1, 0.05,0.1 ],
  [0.05,0.05,0.1,0.5,0.2, 0.1 ],
  [0.05,0.05,0.05,0.1,0.6,0.15],
  [0.05,0.1,0.15,0.1,0.1,0.5 ],
];

function AttentionViz() {
  const [focused, setFocused] = useState(1);
  const isMobile = useIsMobile();
  const weights = ATTN_WEIGHTS[focused];
  const alphaToHex = a => Math.round(a*220).toString(16).padStart(2,"0");

  return (
    <div>
      <div style={{ fontFamily:SANS, fontSize:12, color:C.muted, marginBottom:10 }}>각 단어가 다른 단어를 얼마나 "주목"하는지 — 진할수록 어텐션이 강해요</div>
      <div style={{ display:"flex", gap:isMobile?4:8, marginBottom:6, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ fontFamily:MONO, fontSize:10, color:C.muted, width:60 }}>Query →</div>
        <div style={{ display:"flex", gap:isMobile?4:6, flexWrap:"wrap" }}>
          {ATTN_SENTENCE.map((w,i) => (
            <button key={i} onClick={() => setFocused(i)} style={{
              flex:1, padding:"8px 4px", borderRadius:7, border:`1px solid ${focused===i?C.blue:C.line}`,
              background: focused===i?C.blue+"33":C.card2,
              color: focused===i?C.blue:C.muted, fontFamily:MONO, fontSize:isMobile?11:12, fontWeight:700, cursor:"pointer",
            }}>{w}</button>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", gap:isMobile?4:8, marginBottom:16, alignItems:"flex-start" }}>
        <div style={{ fontFamily:MONO, fontSize:10, color:C.muted, width:50, paddingTop:12, flexShrink:0 }}>Key ↓</div>
        <div style={{ display:"flex", gap:isMobile?5:6, flexWrap:"wrap", flex:1 }}>
          {ATTN_SENTENCE.map((w,i) => (
            <div key={i} style={{
              flex:"1 1 auto", minWidth:isMobile?44:48, maxWidth:64, padding:isMobile?"11px 4px":"10px 0", borderRadius:7,
              background: C.blue+alphaToHex(weights[i]),
              border:`1px solid ${C.blue}${alphaToHex(weights[i]*0.5)}`,
              display:"flex", flexDirection:"column", alignItems:"center", gap:4,
            }}>
              <span style={{ fontFamily:MONO, fontSize:isMobile?11:12, color:C.text, fontWeight:700 }}>{w}</span>
              <span style={{ fontFamily:MONO, fontSize:isMobile?9:9, color:C.muted }}>{(weights[i]*100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:"10px 14px", background:C.card2, borderRadius:8, fontFamily:SANS, fontSize:12, color:C.muted, lineHeight:1.6 }}>
        <span style={{ color:C.blue, fontWeight:700 }}>"{ATTN_SENTENCE[focused]}"</span>을 처리할 때
        가장 주목하는 단어: <span style={{ color:C.green, fontWeight:700 }}>"{ATTN_SENTENCE[weights.indexOf(Math.max(...weights))]}" ({(Math.max(...weights)*100).toFixed(0)}%)</span>
        <br/>이렇게 문맥을 파악해서 번역·요약·질답을 수행해요.
      </div>
    </div>
  );
}

const NN_LAYERS = [
  { name:"입력층",   nodes:4, color:C.blue   },
  { name:"은닉층 1", nodes:6, color:C.purple },
  { name:"은닉층 2", nodes:6, color:C.purple },
  { name:"출력층",   nodes:2, color:C.green  },
];

function NeuralNetViz() {
  const [activeNode, setActiveNode] = useState(null);
  const W = 420, H = 260;
  const layerX = i => 60 + (i/(NN_LAYERS.length-1))*(W-120);
  const nodeY = (li, ni) => {
    const n = NN_LAYERS[li].nodes;
    const spacing = Math.min(36, (H-40)/n);
    const total = (n-1)*spacing;
    return H/2 - total/2 + ni*spacing;
  };

  return (
    <div>
      <div style={{ fontFamily:SANS, fontSize:12, color:C.muted, marginBottom:10 }}>노드를 클릭하면 연결된 뉴런이 활성화돼요</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:"block", background:"#0D1117", borderRadius:12 }}>
        {NN_LAYERS.slice(0,-1).map((layer,li) =>
          Array.from({ length:layer.nodes },(_,ni) =>
            Array.from({ length:NN_LAYERS[li+1].nodes },(_,nj) => {
              const x1=layerX(li),y1=nodeY(li,ni),x2=layerX(li+1),y2=nodeY(li+1,nj);
              const isActive = activeNode && activeNode[0]===li && activeNode[1]===ni;
              return <line key={`${li}-${ni}-${nj}`} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isActive?NN_LAYERS[li].color:C.line} strokeWidth={isActive?1.2:0.4} opacity={isActive?0.8:0.3}/>;
            })
          )
        )}
        {NN_LAYERS.map((layer,li) =>
          Array.from({ length:layer.nodes },(_,ni) => {
            const x=layerX(li),y=nodeY(li,ni);
            const isActive = activeNode && activeNode[0]===li && activeNode[1]===ni;
            return (
              <g key={`${li}-${ni}`} onClick={() => setActiveNode(isActive?null:[li,ni])} style={{ cursor:"pointer" }}>
                <circle cx={x} cy={y} r={isActive?9:7} fill={isActive?layer.color:C.card2} stroke={layer.color} strokeWidth={1.5}/>
                {isActive && <circle cx={x} cy={y} r={14} fill="none" stroke={layer.color} strokeWidth={0.8} opacity={0.4}/>}
              </g>
            );
          })
        )}
        {NN_LAYERS.map((layer,li) => (
          <text key={li} x={layerX(li)} y={H-8} textAnchor="middle" fill={layer.color} fontFamily={MONO} fontSize={11} fontWeight={700}>{layer.name}</text>
        ))}
      </svg>
      <div style={{ marginTop:12, display:"flex", gap:12, fontFamily:MONO, fontSize:10.5, color:C.muted, flexWrap:"wrap" }}>
        <span><span style={{ color:C.blue }}>●</span> 입력층 — 데이터 수신</span>
        <span><span style={{ color:C.purple }}>●</span> 은닉층 — 패턴 학습</span>
        <span><span style={{ color:C.green }}>●</span> 출력층 — 결과 반환</span>
      </div>
    </div>
  );
}

const AI_CONCEPTS = [
  { id:"word2vec",  title:"Word2Vec",          emoji:"🔤", desc:"단어를 벡터로 — 의미가 비슷하면 가까이",   Comp:Word2VecViz  },
  { id:"tokenizer", title:"토큰화 (Tokenizer)", emoji:"✂️", desc:"문장을 AI가 이해하는 조각으로 분해",      Comp:TokenizerViz },
  { id:"attention", title:"어텐션 메커니즘",    emoji:"👁️", desc:"트랜스포머가 단어 간 관계를 파악하는 법", Comp:AttentionViz },
  { id:"neuralnet", title:"신경망 구조",         emoji:"🧠", desc:"입력→은닉→출력 레이어의 연결 구조",      Comp:NeuralNetViz },
];

function AiConceptsScreen({ onBack }) {
  const [active, setActive] = useState("word2vec");
  const isMobile = useIsMobile();
  const concept = AI_CONCEPTS.find(c => c.id === active);
  const Comp = concept.Comp;

  return (
    <div style={{ padding: isMobile ? "20px 16px 60px" : "32px 32px 60px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.muted, fontFamily:SANS, fontSize:13, cursor:"pointer", marginBottom:16, padding:0 }}>← 코딩 학습</button>
      <div style={{ fontFamily:SANS, fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>AI 개념 시각화</div>
      <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom:24 }}>복잡한 AI/ML 개념을 인터랙티브하게 이해해요</div>
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)", gap:10, marginBottom:24 }}>
        {AI_CONCEPTS.map(c => (
          <button key={c.id} onClick={() => setActive(c.id)} style={{
            padding:isMobile?"12px 10px":"14px 12px", borderRadius:12,
            border:`1px solid ${active===c.id?C.blue:C.line}`,
            background: active===c.id?C.blue+"18":C.card, cursor:"pointer", textAlign:"left",
          }}>
            <div style={{ fontSize:isMobile?18:22, marginBottom:6 }}>{c.emoji}</div>
            <div style={{ fontFamily:SANS, fontSize:isMobile?11:12.5, fontWeight:700, color:active===c.id?C.blue:C.text, marginBottom:4 }}>{c.title}</div>
            {!isMobile && <div style={{ fontFamily:SANS, fontSize:10.5, color:C.muted, lineHeight:1.4 }}>{c.desc}</div>}
          </button>
        ))}
      </div>
      <div style={{ background:C.card, border:`1px solid ${C.line}`, borderRadius:14, padding:isMobile?16:24 }}>
        <div style={{ fontFamily:SANS, fontSize:15, fontWeight:800, color:C.text, marginBottom:16 }}>{concept.emoji} {concept.title}</div>
        <Comp />
      </div>
    </div>
  );
}

const LANG_LIST = [
  { id: "python", name: "Python",       icon: "🐍", color: C.blue,   available: true },
  { id: "java",   name: "Java",         icon: "☕", color: C.coral,  available: true },
  { id: "sql",    name: "SQL",          icon: "🗃️", color: C.green,  available: true },
  { id: "aivis",  name: "AI 개념 시각화", icon: "🤖", color: C.purple, available: true, isAI: true },
];

const CHAPTERS = {
  python: [
    { id: "basics",    title: "반복문·순회",       icon: "🔁", lessons: [PY_LESSONS[0]] },
    { id: "control",   title: "제어문",             icon: "🔀", lessons: [PY_LESSONS[2], PY_LESSONS[3]] },
    { id: "functions", title: "함수·컴프리헨션",   icon: "🧩", lessons: [PY_LESSONS[4], PY_LESSONS[7]] },
    { id: "ds",        title: "자료구조",           icon: "📦", lessons: [PY_LESSONS[5], PY_LESSONS[6]] },
    { id: "exception", title: "예외 처리",          icon: "🛡️", lessons: [PY_LESSONS[8]] },
    { id: "algo",      title: "알고리즘",           icon: "🔄", lessons: [PY_LESSONS[1]] },
  ],
  java: [
    { id: "basics",      title: "기초 문법",            icon: "📝", lessons: [JAVA_LESSONS[0]] },
    { id: "collections", title: "컬렉션 프레임워크",    icon: "📦", lessons: [JAVA_LESSONS[1], JAVA_LESSONS[2], JAVA_LESSONS[3], JAVA_LESSONS[4]] },
    { id: "stream",      title: "Stream API",           icon: "🌊", lessons: [JAVA_LESSONS[5]] },
  ],
  sql: [
    { id: "basics", title: "기초 조회",      icon: "📋", lessons: [SQL_LESSONS[0]] },
    { id: "agg",    title: "집계·그룹화",    icon: "📊", lessons: [SQL_LESSONS[1], SQL_LESSONS[5]] },
    { id: "join",   title: "JOIN·서브쿼리",  icon: "🔗", lessons: [SQL_LESSONS[2], SQL_LESSONS[3]] },
    { id: "dml",    title: "데이터 조작 DML", icon: "✏️", lessons: [SQL_LESSONS[4]] },
    { id: "adv",    title: "고급 SQL",        icon: "⚡", lessons: [SQL_LESSONS[6], SQL_LESSONS[7]] },
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
  const completedSet = getCompletedSet(langId);
  const completedCount = chapter?.lessons.filter(l => completedSet.has(l.id)).length ?? 0;
  const totalCount = chapter?.lessons.length ?? 0;

  return (
    <div style={{ padding:"32px 32px 60px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.muted, fontFamily:SANS, fontSize:13, cursor:"pointer", marginBottom:16, padding:0 }}>← {chapter?.title}</button>
      <div style={{ fontFamily:SANS, fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>{chapter?.icon} {chapter?.title}</div>
      <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom: completedCount > 0 ? 10 : 28 }}>학습할 레슨을 선택하세요</div>
      {completedCount > 0 && (
        <div style={{ fontFamily:MONO, fontSize:11, color:C.green, marginBottom:18 }}>
          ✓ {completedCount}/{totalCount} 완료
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {chapter?.lessons.map((lesson, i) => {
          const isDone = completedSet.has(lesson.id);
          return (
            <button key={lesson.id} onClick={() => onSelect(lesson)} style={{
              display:"flex", alignItems:"center", gap:16, padding:"18px 20px",
              borderRadius:12, border:`1px solid ${isDone ? C.green+"55" : lang?.color+"44"}`,
              background: isDone ? C.green+"0A" : lang?.color+"0D", cursor:"pointer", textAlign:"left",
            }}>
              <div style={{ width:32, height:32, borderRadius:8, background: isDone ? C.green+"33" : lang?.color+"33", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:MONO, fontSize:13, fontWeight:700, color: isDone ? C.green : lang?.color }}>
                {isDone ? "✓" : i + 1}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:SANS, fontSize:14, fontWeight:700, color: isDone ? C.muted : C.text }}>{lesson.title}</div>
                {lesson.desc && <div style={{ fontFamily:SANS, fontSize:12, color:C.muted, marginTop:2 }}>{lesson.desc}</div>}
              </div>
              {isDone && <span style={{ fontFamily:MONO, fontSize:10, color:C.green, flexShrink:0 }}>완료</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// localStorage 완료 레슨 헬퍼
function getCompletedSet(langId) {
  try { return new Set(JSON.parse(localStorage.getItem(`ddok_done_${langId}`) || "[]")); }
  catch { return new Set(); }
}
function saveCompletedSet(langId, set) {
  localStorage.setItem(`ddok_done_${langId}`, JSON.stringify([...set]));
}

function LessonViewScreen({ lesson, langId, isGuest, onBack }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!lesson?.id || !langId || isGuest) return;
    const set = getCompletedSet(langId);
    if (set.has(lesson.id)) { setDone(true); return; }

    // 레슨 첫 진입 → 세션 기록 + 진도 업데이트
    set.add(lesson.id);
    saveCompletedSet(langId, set);
    setDone(true);

    const h = authHeader();
    fetch(`${API}/api/dashboard/session?course_id=${langId}&duration_minutes=5`, { method:"POST", headers:h }).catch(()=>{});
    fetch(`${API}/api/dashboard/progress?course_id=${langId}&completed_lessons=${set.size}`, { method:"POST", headers:h }).catch(()=>{});
  }, [lesson?.id, langId, isGuest]);

  return (
    <div style={{ padding:"32px 32px 60px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:C.muted, fontFamily:SANS, fontSize:13, cursor:"pointer", padding:0 }}>← 레슨 목록</button>
        {done && <span style={{ fontFamily:MONO, fontSize:11, color:C.green, background:C.green+"22", padding:"3px 8px", borderRadius:5, fontWeight:700 }}>✓ 학습 완료</span>}
      </div>
      <div style={{ background:C.card, border:`1px solid ${done ? C.green+"44" : C.line}`, borderRadius:14, padding:20 }}>
        <div style={{ fontFamily:SANS, fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>{lesson.title}</div>
        <div style={{ fontFamily:SANS, fontSize:12, color:C.muted, marginBottom:16 }}>{lesson.desc || ""}</div>
        {lesson.isSql
          ? <SqlVisualizer lesson={lesson} />
          : lesson.isBubble
            ? <BubbleSortVisualizer data={lesson.sortData} />
            : <StepVisualizer lesson={lesson} />
        }
      </div>
    </div>
  );
}

function CodeScreen({ isGuest }) {
  const [lang, setLang]       = useState(null);
  const [chapter, setChapter] = useState(null);
  const [lesson, setLesson]   = useState(null);

  if (!lang)            return <LangListScreen onSelect={setLang} />;
  if (lang === "aivis") return <AiConceptsScreen onBack={() => setLang(null)} />;
  if (!chapter)         return <ChapterListScreen langId={lang} onSelect={setChapter} onBack={() => setLang(null)} />;
  if (!lesson)          return <LessonListScreen langId={lang} chapterId={chapter} onSelect={setLesson} onBack={() => setChapter(null)} />;
  return <LessonViewScreen lesson={lesson} langId={lang} isGuest={isGuest} onBack={() => setLesson(null)} />;
}

// ── 자격증 목록 ──────────────────────────────────
const CERT_LIST = [
  { id: "aice", name: "AICE Associate", icon: "🏆", desc: "AI 역량 검증 자격증 · 14문항", color: C.purple, available: true },
  { id: "sqld", name: "SQLD",           icon: "🗃️", desc: "SQL 개발자 자격증",            color: C.green,  available: false },
  { id: "adsp", name: "ADsP",           icon: "📊", desc: "데이터 분석 준전문가 · 40문항", color: C.blue,   available: true  },
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
  { round: 1, label: "1회 모의고사", desc: "콜센터 상담 데이터 · 만족도 예측 (회귀)", available: true },
  { round: 2, label: "2회 모의고사", desc: "이커머스 주문 데이터 · 매출 예측 (회귀)", available: true },
  { round: 3, label: "3회 모의고사", desc: "의료 환자 데이터 · 재입원 예측 (분류)",   available: true },
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

// ── ADsP 기출 모의고사 ────────────────────────────
// ── ADsP 회차별 기출 데이터 ────────────────────────
const _Q = (no,sub,q,opts,ans,ex) => ({no,sub,q,opts,ans,ex});
const ADSP_ROUNDS = {
  13: [
    _Q(1,1,"DIKW 피라미드의 계층적 구성요소에 해당하지 않는 것은?",["지혜(Wisdom)","정보(Information)","데이터(Data)","아이디어(Idea)"],3,"DIKW: Data→Information→Knowledge→Wisdom. 아이디어는 DIKW 계층 구성요소에 포함되지 않습니다."),
    _Q(2,1,"데이터베이스 활용에 대한 설명 중 올바르지 않은 것은?",["2000년대 기업 DB의 화두는 CRM과 SCM의 등장이다","금융부문에 DW를 적극 도입해 DB 마케팅을 증대했다","사회기반 DB는 교육·의료 부문에서는 활용하지 않는다","실시간 기업은 환경 변화에 적응 속도를 최대화한 정보화 전략이다"],2,"교육(NEIS), 의료(PACS) 등 사회기반 데이터베이스는 교육·의료 부문에서도 광범위하게 활용됩니다."),
    _Q(3,1,"빅데이터 활용 기법과 사례 연결이 적절하지 않은 것은?",["사용자 집단 파악 → 유형분석","최적 프로그램·시간대 결정 → 유전 알고리즘","구매자 나이와 차량 타입 관계 → 회귀분석","커피 구매자의 탄산음료 구매 여부 → 기계학습"],3,"커피→탄산음료 구매 관계는 연관분석(Association Rule)에 해당합니다."),
    _Q(4,1,"빅데이터에 관한 설명으로 가장 적절한 것은?",["데이터 가치 창출은 데이터 규모에 크게 좌우된다","비즈니스 핵심에 대한 객관적이고 종합적인 통찰 데이터를 확보해야 한다","빅데이터 프로젝트의 가장 큰 걸림돌은 소요 비용이다","성과 높은 기업은 폭넓은 분석적 통찰력을 갖춘다"],1,"빅데이터의 핵심은 규모가 아니라 거기서 어떤 통찰을 얻느냐입니다. 걸림돌은 비용이 아닌 분석적 방법과 성과 이해 부족입니다."),
    _Q(5,1,"빅데이터의 궁극적인 최종 목적으로 가장 적절한 것은?",["데이터 분석 기반 전략적 분석과 가치 창출","복잡하고 정교한 알고리즘 작성","분석 비용의 절감","데이터 최적화 능력 향상"],0,"빅데이터의 궁극적 목적은 전략적 분석을 통한 비즈니스 가치 창출입니다. 알고리즘이나 비용 절감은 수단입니다."),
    _Q(6,1,"빅데이터 위기요인과 통제방안 중 올바르지 않은 것은?",["데이터 오용 대응: 알고리즘 접근권 보장과 알고리즈미스트 필요","채용·대출 등 예측 자료에 의한 불이익 최소화 장치 필요","책임 원칙 훼손 대응: 동의제를 책임제로 전환이 효과적","사생활 침해 증가로 개인정보 활용 가이드라인 제정 요구"],2,"사생활 침해 통제방안은 '책임제에서 동의제로 전환'입니다. ③은 방향이 반대입니다."),
    _Q(7,1,"용어와 의미 연결이 잘못된 것은?",["OLTP - 다차원 데이터 대화식 분석 소프트웨어","BA - 경영 의사결정을 위한 통계·수학적 분석 기법","BI - 데이터 기반 의사결정 지원 리포트 중심 도구","Data Mining - 대용량 데이터에서 의미 있는 관계·패턴 발견"],0,"다차원 데이터 대화식 분석은 OLAP(Online Analytical Processing)에 대한 설명입니다. OLTP는 실시간 트랜잭션 처리 시스템입니다."),
    _Q(8,1,"딥러닝에 활용되는 오픈소스가 아닌 것은?",["Anaconda","TensorFlow","Theano","Torch"],0,"딥러닝 오픈소스: TensorFlow, Theano, Keras, Torch, Caffe 등. Anaconda는 파이썬 패키지 관리 플랫폼으로 딥러닝 전용 오픈소스가 아닙니다."),
    _Q(9,1,"비정형 데이터 형태로 저장·분석되며 언어·문자 등으로 기술되는 데이터 유형은?",["정량적 데이터","정성적 데이터","관계형 데이터","메타 데이터"],1,"정성적 데이터(Qualitative Data)는 텍스트·이미지·음성 등 비정형 형태로 감정·의견·특성을 기술합니다."),
    _Q(10,1,"다양한 영역의 Raw 데이터(원시 데이터)를 원본 형태 그대로 한 곳에 모아 저장하는 저장소는?",["데이터 마트","데이터 웨어하우스","데이터 레이크","OLAP 큐브"],2,"데이터 레이크(Data Lake)는 정형·반정형·비정형 데이터를 원본 상태로 저장하며 ELT 방식으로 필요 시 처리합니다."),
    _Q(11,2,"기업의 합리적 의사결정 장애 요소에 해당하는 것은?",["프레이밍 효과·고정관념","비편향적 사고·프레이밍 효과","비편향적 사고·고정관념","편향된 생각·방법론에 근거한 의사결정"],0,"고정관념, 편향된 생각, 프레이밍 효과는 합리적 의사결정을 방해하는 장애 요소입니다."),
    _Q(12,2,"빅데이터 특징을 고려한 분석 요소 중 투자 비용 요소에 해당하지 않는 것은?",["Volume(규모)","Variety(다양성)","Velocity(속도)","Value(가치)"],3,"Value(가치)는 비즈니스 효과 측면의 요소입니다. Volume·Variety·Velocity는 데이터 처리 비용과 직결되는 투자 비용 요소입니다."),
    _Q(13,2,"분석 대상이 불분명하고 기존 분석 방식으로 새로운 지식을 도출하는 분석 주제 유형은?",["Optimization(최적화)","Insight(통찰)","Solution(솔루션)","Discovery(발견)"],1,"Insight: 방법은 알지만 대상 불분명. Optimization: 방법·대상 명확. Solution: 대상 명확·방법 불명확. Discovery: 방법·대상 모두 불명확."),
    _Q(14,2,"CRISP-DM의 모델링(Modeling) 단계에 해당하지 않는 것은?",["모델링 기법 선택","모델 작성","모델 평가","모델 적용성 평가"],3,"모델 적용성 평가는 평가(Evaluation) 단계에 해당합니다. 모델링 단계: 기법 선택, 모델 작성, 테스트 설계, 모델 평가."),
    _Q(15,2,"데이터 분석 프로젝트 실행과정 관리 중 가장 부적절한 것은?",["일정을 제한하는 일정계획은 분석에 적절하지 않다","분석 과제 위험을 사전에 식별하고 대응방안을 수립한다","알고리즘에 따라 범위가 변할 수 있어 범위 관리가 중요하다","프로젝트 관리 프로세스가 통합적으로 운영되도록 관리한다"],0,"분석 프로젝트도 타임박싱(Time-boxing) 기법으로 일정 관리가 필요합니다. 일정계획 없이 진행하면 프로젝트 통제가 어렵습니다."),
    _Q(16,2,"분석 준비도 진단의 분석 업무 파악 영역에 해당하지 않는 것은?",["발생한 사실 분석 업무","예측분석 업무","최적화 분석 업무","통계분석 업무"],3,"통계분석 업무는 IT 인프라 영역에 해당합니다. 분석 업무 파악 영역: 사실 분석, 예측 분석, 최적화 분석 업무."),
    _Q(17,2,"분석 과제 관리 프로세스 설명 중 부적절한 것은?",["과제발굴과 과제수행·모니터링으로 구성","분석 문화 내재화 및 경쟁력 확보에 기여","발굴 아이디어와 확정 결과물 모두 Pool로 관리·공유","수행 단계에서 팀 구성·지속 모니터링·결과 공유·개선"],2,"과제발굴 단계는 과제 후보(아이디어)를, 과제수행 단계는 과제 결과를 각각 Pool로 관리합니다. 두 가지를 혼합 관리하지 않습니다."),
    _Q(18,2,"빅데이터 거버넌스 설명 중 옳은 것을 고르면? (ⓐ전사 모든 데이터 이용, ⓑERD 변경 관리 필요, ⓒ데이터 유형별·거버넌스 요소별 구분, ⓓ품질>생명주기 관리)",["ⓐ","ⓐ·ⓑ","ⓑ·ⓒ","ⓐ·ⓑ·ⓒ·ⓓ"],2,"∙ⓐ 잘못: 목적에 맞는 데이터 활용이 중요 ∙ⓓ 잘못: 생명주기 관리와 품질관리 모두 동등하게 중요합니다."),
    _Q(19,2,"분석 과제 관리 프로세스에서 팀 구성·지속 모니터링·결과 공유·개선을 수행하는 단계는?",["과제발굴","과제수행","과제검토","과제평가"],1,"분석 과제 관리 프로세스: 과제발굴(아이디어→후보 Pool) → 과제수행(팀 구성·실행·모니터링·결과 공유·개선)."),
    _Q(20,2,"데이터 거버넌스 저장소 관리에서 데이터 관리 체계를 지원하는 일련의 단계·절차·구조를 나타내는 것은?",["데이터 카탈로그","워크플로우(Workflow)","메타데이터 저장소","데이터 스튜어드십"],1,"워크플로우는 특정 작업이나 프로세스를 수행하기 위한 일련의 단계 및 절차를 나타내는 체계적 구조입니다. 데이터 구조 변경 시 사전영향평가도 함께 수행합니다."),
    _Q(21,3,"최적회귀방정식 변수선택 방법 설명 중 부적절한 것은?",["전진선택법: 중요 변수를 차례로 추가","후진제거법: 전체 포함 후 영향 적은 변수부터 제거","단계별 선택 결과는 전진선택법·후진제거법과 항상 일치","후진제거법: 한번 제거된 변수는 재추가 불가"],2,"전진선택법과 후진제거법은 다른 기준을 사용하므로 결과가 다를 수 있습니다. 단계별 선택은 두 방법의 장점을 결합하지만 결과가 항상 일치하지는 않습니다."),
    _Q(22,3,"붓스트랩 표집에서 관측치 선정을 d번 반복할 때 d→∞이면 하나의 관측치가 선정되지 않을 확률은?",["약 36.8%","약 63.2%","약 25.4%","약 95.0%"],0,"(1-1/d)^d → e^(-1) ≈ 0.368 = 36.8%. 즉 약 63.2%의 관측치가 훈련 데이터로, 나머지 36.8%는 검증 데이터로 사용됩니다."),
    _Q(23,3,"다중회귀 결과(R²=86.9%, 잔차 자유도=21, 독립변수 10개, 표본 수=32)에서 부적절한 설명은?",["후진제거법 시 가장 먼저 제거할 변수는 t값이 가장 큰 wt이다","결정계수는 86.9%이다","전체 관측치는 32개이다","이 회귀모형은 유의한 모형이다"],0,"후진제거법은 t값(영향력)이 가장 작은 변수부터 제거합니다. t값이 가장 큰 변수는 마지막까지 유지됩니다. 표본 수=자유도(21)+독립변수(10)+1=32."),
    _Q(24,3,"주성분 분석 결과 해석 중 부적절한 것은?",["공분산 행렬 사용 시 측정 단위에 민감하다","첫 두 주성분이 설명하는 분산은 45.01%이다","분산 비율이 커짐에 따라 주성분이 설명하는 분산 비율도 낮아진다","각 주성분 간에는 서로 독립 관계이다"],2,"누적 분산 비율은 주성분이 추가될수록 커집니다(내림차순 정렬). 각 주성분의 설명 분산은 낮아지지만 누적 설명력은 증가합니다."),
    _Q(25,3,"시계열 데이터 분석 절차 순서로 가장 적절한 것은? (ⓐ그래프 그리기 ⓑ추세·계절요인 파악·제거 ⓒ잔차 예측 ⓓ잔차 모델 적합 ⓔ추세·계절성 재반영 예측)",["ⓐ→ⓑ→ⓒ→ⓓ→ⓔ","ⓔ→ⓐ→ⓑ→ⓒ→ⓓ","ⓐ→ⓑ→ⓓ→ⓔ→ⓒ","ⓑ→ⓐ→ⓒ→ⓓ→ⓔ"],0,"시계열 분석: ①그래프 시각화 → ②추세·계절성 제거(정상화) → ③잔차 예측 → ④모델 적합 및 조정 → ⑤추세·계절성 재반영하여 최종 예측."),
    _Q(26,3,"오분류표(TP=40, FP=60, FN=60, TN=40, 전체=200)에서 F1 Score는?",["0.4","0.6","0.8","1.0"],0,"Precision=TP/(TP+FP)=40/100=0.4, Recall=TP/(TP+FN)=40/100=0.4, F1=2×(0.4×0.4)/(0.4+0.4)=0.4"),
    _Q(27,3,"통계적 가설검정 설명 중 부적절한 것은?",["사실인 귀무가설을 기각하면 1종 오류","사실이 아닌 귀무가설을 채택하면 2종 오류","유의수준: 귀무가설 사실일 때 기각으로 발생하는 오류 확률","검정력: 귀무가설이 틀렸는데 옳다고 하는 오류"],3,"검정력(1-β)은 귀무가설이 사실이 아닐 때 이를 기각할 확률입니다. 귀무가설이 틀렸는데 채택하는 오류는 2종 오류(β)입니다."),
    _Q(28,3,"자료 척도 설명 중 부적절한 것은?",["명목척도: 특성 분류·확인 목적으로 숫자 부여","서열척도: 순위만 제공, 양적 비교 불가","등간척도: 순위 간격 동일, 양적 비교 가능","비율척도: 비율 계산 가능, 절대 영점 존재하지 않음"],3,"비율척도(Ratio Scale)는 절대 영점(0)이 존재합니다. 예: 키, 몸무게, 소득, 나이. 절대 영점이 없는 것은 등간척도(예: 온도)입니다."),
    _Q(29,3,"군집 내 오차제곱합(ESS)을 최소화하는 방향으로 군집을 병합하는 계층적 군집분석 연결법은?",["중심 연결법","평균 연결법","와드 연결법","최단 연결법"],2,"와드(Ward) 연결법은 두 군집 병합 시 군집 내 분산(ESS) 증가가 최소인 쌍을 선택합니다. 다른 연결법과 달리 거리가 아닌 분산 기준을 사용합니다."),
    _Q(30,3,"K-Medoids 알고리즘의 일종으로 이상치에 덜 민감하고 실제 데이터 포인트를 군집 중심으로 선택하는 R 함수는?",["PAM()","nnet()","mClust()","jaccard()"],0,"PAM(Partitioning Around Medoids)은 K-Medoids 방법으로 군집 중심을 실제 데이터 포인트 중에서 선택하여 이상치 영향을 줄입니다."),
    _Q(31,3,"실제 양성 중 모델이 양성으로 정확히 예측한 비율로 모형의 완전성(Completeness)을 평가하는 지표는?",["정확도(Precision)","재현율(Recall)","오분류율(Error Rate)","특이도(Specificity)"],1,"재현율(Recall) = TP/(TP+FN). 실제 양성 중 올바르게 찾아낸 비율. 민감도(Sensitivity)와 동일합니다."),
    _Q(32,3,"통계적 추론 설명 중 부적절한 것은?",["점추정: 모수를 가장 잘 대표하는 단일 수치","구간추정: 모수 참값이 포함될 범위를 구간으로 표현","비즈니스 상황에서 표본 통계량으로 모수를 추정하는 것은 귀납적 추리","신뢰구간에 실제 모수가 반드시 포함되어야 한다"],3,"신뢰구간은 모수가 포함될 가능성이 높은 구간이지 반드시 포함된다고 보장할 수 없습니다. 95% 신뢰구간이면 100번 중 약 95번 포함됩니다."),
    _Q(33,3,"이산형 확률변수 X의 기댓값은? (x=1: f=0.2, x=2: f=0.3, x=3: f=0.2, x=4: f=0.075)",["1","1.7","2.5","10"],1,"E(X)=Σxf(x)=1×0.2+2×0.3+3×0.2+4×0.075=0.2+0.6+0.6+0.3=1.7"),
    _Q(34,3,"대용량 데이터 속에서 숨겨진 지식·새로운 규칙을 추출하는 과정은?",["데이터마이닝","데이터마트","데이터웨어하우징","의사결정시스템"],0,"데이터 마이닝(Data Mining)은 대용량 데이터에서 패턴·규칙·지식을 추출하여 예측·분류·군집화·연관규칙 발견 등에 활용합니다."),
    _Q(35,3,"과대적합(Overfitting) 설명 중 부적절한 것은?",["학습 데이터가 모집단 특성을 충분히 설명 못할 때 발생","변수가 많아 모형이 복잡할 때 발생","훈련 성능은 우수하나 새 데이터 일반화 성능이 낮다","평가용 데이터의 작은 변화에 민감하게 반응하지 못한다"],3,"과대적합 모델은 훈련 데이터에 과도하게 최적화되어 새로운 데이터(평가용)의 작은 변화에도 민감하게 반응합니다. ④는 반대로 설명하고 있습니다."),
    _Q(36,3,"범주형 목표변수를 예측하는 예측모형의 주목적으로 적절한 것은?",["연관분석","분류(Classification)","시뮬레이션","최적화"],1,"분류 모형(Classification)은 범주형(이산형) 목표변수를 예측합니다. 회귀 모형은 연속형 목표변수를 예측합니다."),
    _Q(37,3,"연관규칙 유의미성 평가 지표가 아닌 것은?",["지지도(Support)","신뢰도(Confidence)","순수도(Purity)","향상도(Lift)"],2,"연관규칙 평가 지표: 지지도, 신뢰도, 향상도. 순수도(Purity)는 의사결정나무의 분기 품질을 측정하는 지표입니다."),
    _Q(38,3,"중심극한정리 설명 중 부적절한 것은?",["모집단이 정규분포여야 표본평균 분포가 정규분포로 근사한다","표본크기가 최소 30 이상이어야 성립한다","비정규 모집단도 표본크기에 따라 정규 근사가 가능하다","표본크기가 클수록 정규분포에 더 근접한다"],0,"중심극한정리는 모집단 분포와 무관하게, 표본 크기가 충분히 크면(보통 n≥30) 표본평균의 분포가 정규분포에 근사합니다."),
    _Q(39,3,"연관규칙 커피→우유 향상도는? (총 1000건: P(커피)=0.6, P(우유)=0.6, P(커피∩우유)=0.3)",["30.5%","50.0%","83.3%","93.3%"],2,"향상도=P(커피∩우유)/(P(커피)×P(우유))=0.3/(0.6×0.6)=0.3/0.36≈0.833=83.3%"),
    _Q(40,3,"주성분 개수 선택 방법 중 부적절한 것은?",["전체변이 70~90%가 되도록 주성분 수 결정","고윳값이 평균 이상인 주성분을 제거","Scree Plot에서 고윳값이 완만해지는 지점-1개 선택","여러 기준을 종합적으로 판단하여 선택"],1,"고윳값 평균 이상인 주성분을 '선택(유지)'해야 합니다. ②는 제거라고 잘못 설명하고 있습니다."),
    _Q(41,3,"시계열 데이터 설명 중 부적절한 것은?",["계절성: 특정 기간마다 반복하는 규칙적 패턴","노이즈: 추세·계절성으로 설명되는 데이터","시계열: 관측치가 시간적 순서를 가진 데이터","과거 데이터로 현재 움직임과 미래를 예측"],1,"노이즈(잔차·불규칙 성분)는 추세·계절성·주기성으로도 설명되지 않는 불규칙 변동 성분입니다. ②는 정반대로 설명하고 있습니다."),
    _Q(42,3,"최적회귀방정식 설명 중 부적절한 것은?",["모든 조합의 회귀분석: AIC·BIC 기준으로 모형 선택","전진선택법: 한번 제거된 변수는 재추가 불가","가능한 적은 수의 독립변수를 포함시킨다","단계별 방법: 전진선택 중 기존 변수 중요도 악화 시 제거"],1,"'한번 제거된 변수는 재추가 불가'는 후진제거법의 특징입니다. 전진선택법에서 한번 추가된 변수는 제거되지 않습니다."),
    _Q(43,3,"잔차의 제곱합을 최소로 하는 회귀계수 추정량은?",["최대우도추정량(MLE)","베이즈추정량","최소제곱추정량(OLS)","주성분추정량"],2,"최소제곱법(Ordinary Least Squares)은 실제값과 예측값 차이(잔차)의 제곱합을 최소화하여 회귀계수를 추정합니다."),
    _Q(44,3,"관측되지 않는 잠재변수에 의존하는 확률모델에서 최대우도 매개변수를 찾는 반복적 알고리즘은?",["K-means 알고리즘","MCMC 알고리즘","Gibbs 샘플링","EM 알고리즘"],3,"EM(Expectation-Maximization) 알고리즘: E단계(잠재변수 기댓값 계산)와 M단계(최대우도 파라미터 갱신)를 반복합니다. 혼합분포 군집에 활용됩니다."),
    _Q(45,3,"이진 분류 시스템에서 x축(1-특이도), y축(민감도)으로 성능을 시각화한 그래프는?",["정밀도-재현율 곡선","ROC 곡선","향상도 곡선","누적이익 곡선"],1,"ROC(Receiver Operating Characteristic) 곡선: x축=FPR(1-특이도), y축=TPR(민감도/재현율). AUC가 1에 가까울수록 우수한 모델입니다."),
    _Q(46,3,"사분위수(Quantile)에서 3/4 구간(75th percentile)보다 큰 자료의 비율은?",["10%","25%","50%","75%"],1,"3/4분위수(Q3, 75th percentile)보다 큰 값은 전체의 상위 25%에 해당합니다."),
    _Q(47,3,"거래 데이터(우유 10건, 커피 20건, 우유·커피 동시 30건, 커피·초콜릿 40건, 총 100건)에서 우유→커피 지지도는?",["0.1","0.2","0.3","0.4"],2,"지지도(Support)=A와 B 동시 포함 거래 수/전체 거래 수=30/100=0.3"),
  ],
  44: [
    _Q(1,1,"빅데이터 특성 3V에서 데이터의 생성·수집·처리 속도를 나타내는 것은?",["Volume","Velocity","Variety","Value"],1,"3V: Volume(규모), Velocity(속도), Variety(다양성). Velocity는 실시간 데이터 처리 속도를 의미합니다."),
    _Q(2,1,"관계형 DBMS(RDBMS)에 대한 설명으로 옳지 않은 것은?",["테이블(행·열) 구조로 데이터 저장","SQL로 데이터 조회·조작 가능","ACID 트랜잭션 지원","NoSQL보다 수평 확장(Scale-out)이 용이"],3,"RDBMS는 수직 확장에 강하며 수평 확장(Scale-out)은 NoSQL이 훨씬 용이합니다."),
    _Q(3,1,"개인정보 비식별화 기법 중 특정 항목의 값을 집계값(평균·합계)으로 대체하는 기법은?",["가명처리","총계처리","데이터 범주화","데이터 마스킹"],1,"총계처리는 개별 값을 평균·합계 등 집계값으로 대체하여 개인 식별을 방지합니다."),
    _Q(4,1,"메타데이터(Metadata)에 대한 설명으로 옳은 것은?",["실제 비즈니스 거래 데이터","데이터에 대한 데이터로 데이터를 설명하는 정보","비정형 데이터의 한 유형","실시간으로 생성되는 스트리밍 데이터"],1,"메타데이터는 '데이터에 대한 데이터'로 데이터의 구조·형식·출처·생성일시 등을 설명합니다."),
    _Q(5,1,"웹 페이지를 자동으로 탐색하여 데이터를 수집하는 기술은?",["데이터베이스 쿼리","크롤링(Crawling)","데이터 시각화","데이터 암호화"],1,"크롤링은 웹 페이지를 자동으로 탐색해 데이터를 수집합니다. 수집된 HTML을 파싱(Parsing)하여 필요한 정보를 추출합니다."),
    _Q(6,2,"SAS Institute에서 개발한 데이터 중심의 분석 방법론은?",["CRISP-DM","KDD","SEMMA","빅데이터 분석 방법론"],2,"SEMMA(Sample·Explore·Modify·Model·Assess)는 SAS Institute에서 개발한 데이터 마이닝 방법론입니다."),
    _Q(7,2,"분석 기획의 '문제 탐색' 단계에서 수행하는 주요 활동은?",["데이터 수집 및 정제","알고리즘 선택 및 모델 학습","비즈니스 현황 파악 및 분석 기회 발굴","모델 성능 평가 및 배포"],2,"문제 탐색 단계에서는 현황 분석, 이해관계자 인터뷰 등을 통해 비즈니스 분석 기회를 발굴합니다."),
    _Q(8,2,"각 현업 부서 내에 분석 인력을 배치하는 분석 조직 구조는?",["집중형","분산형(기능 중심형)","CoE 중심형","매트릭스형"],1,"분산형은 각 현업 부서에 분석 인력이 배치되어 부서별 수요에 직접 대응합니다. 집중형은 별도 전담 조직 운영입니다."),
    _Q(9,2,"분석 마스터 플랜 수립의 올바른 순서는?",["분석 과제 발굴→우선순위 결정→로드맵 수립→거버넌스 설계","거버넌스 설계→과제 발굴→우선순위 결정→로드맵 수립","우선순위 결정→과제 발굴→로드맵 수립→거버넌스 설계","로드맵 수립→과제 발굴→우선순위 결정→거버넌스 설계"],0,"마스터 플랜: 과제 발굴 → 우선순위 결정 → 로드맵 수립 → 거버넌스 체계 설계 순으로 진행합니다."),
    _Q(10,2,"데이터 분석가의 역량 중 '소프트 스킬(Soft Skill)'에 해당하는 것은?",["통계 및 수학적 지식","프로그래밍 언어 능력","머신러닝 알고리즘 이해","커뮤니케이션 및 스토리텔링"],3,"커뮤니케이션·스토리텔링·비즈니스 이해력은 소프트 스킬입니다. 통계·프로그래밍·알고리즘은 하드 스킬(Hard Skill)입니다."),
    _Q(11,3,"표준편차에 대한 설명으로 옳은 것은?",["분산의 제곱으로 계산","분산의 제곱근으로 원데이터와 같은 단위","데이터 중심 경향을 나타내는 지표","값이 클수록 데이터가 집중됨"],1,"표준편차 = √분산. 분산은 단위가 제곱이라 해석이 어렵지만, 표준편차는 원데이터와 동일 단위로 직관적 해석이 가능합니다."),
    _Q(12,3,"단순 선형 회귀에서 결정계수(R²)가 1에 가까울수록 의미하는 것은?",["과소적합 상태","독립변수가 종속변수 변동을 잘 설명함","잔차(Residual)가 크다","독립변수 수가 많다"],1,"R²은 0~1 사이로 1에 가까울수록 독립변수가 종속변수 분산의 더 많은 부분을 설명합니다."),
    _Q(13,3,"의사결정나무 C4.5 알고리즘의 분리 기준은?",["지니 지수(Gini Index)","정보이득비율(Gain Ratio)","카이제곱 통계량","F-통계량"],1,"C4.5는 ID3의 정보이득(Information Gain) 대신 정보이득비율(Gain Ratio)을 사용해 다중값 속성 편향을 보정합니다."),
    _Q(14,3,"군집 간 거리로 두 군집에서 가장 가까운 두 점 사이 거리를 사용하는 방법은?",["완전연결법(Complete Linkage)","단일연결법(Single Linkage)","평균연결법(Average Linkage)","와드연결법(Ward's Method)"],1,"단일연결법(Single Linkage)은 두 군집에서 가장 가까운 점 사이의 거리를 군집 간 거리로 사용합니다."),
    _Q(15,3,"분류 모델의 정밀도(Precision)를 구하는 공식은?",["TP / (TP + FP)","TP / (TP + FN)","TN / (TN + FP)","(TP + TN) / 전체"],0,"Precision = TP/(TP+FP): 양성으로 예측한 것 중 실제 양성 비율. Recall = TP/(TP+FN): 실제 양성 중 양성으로 예측한 비율."),
    _Q(16,3,"연관규칙 향상도(Lift)가 1보다 클 때의 의미는?",["A와 B는 음의 연관관계","A와 B는 독립 관계","A와 B는 양의 연관관계(우연보다 더 자주 함께 발생)","A와 B는 완전 상관관계"],2,"Lift = P(A∩B)/(P(A)×P(B)). Lift>1: 양의 연관, Lift=1: 독립, Lift<1: 음의 연관입니다."),
    _Q(17,3,"과적합(Overfitting)을 방지하는 방법이 아닌 것은?",["훈련 데이터 양 증가","L1/L2 정규화 적용","더 복잡한 모델(파라미터 증가) 사용","조기 종료(Early Stopping)"],2,"복잡한 모델(파라미터 증가)은 오히려 과적합을 심화시킵니다. 데이터 증가·정규화·드롭아웃·조기 종료가 방지책입니다."),
    _Q(18,3,"로지스틱 회귀에서 사용하는 시그모이드(Sigmoid) 함수의 출력 범위는?",["(-∞, +∞)","(0, 1)","[-1, 1)","[0, +∞)"],1,"시그모이드 σ(x) = 1/(1+e^(-x))의 출력은 (0,1) 범위로 이진 분류의 확률 표현에 적합합니다."),
    _Q(19,3,"시계열 분석에서 계절성(Seasonality)을 제거하는 일반적인 방법은?",["차분(Differencing)","로그 변환","계절 분해(Seasonal Decomposition)","Min-Max 정규화"],2,"계절성은 STL 등 계절 분해로 제거합니다. 추세 제거는 차분, 분산 불안정은 로그 변환으로 처리합니다."),
    _Q(20,3,"텍스트 마이닝에서 TF-IDF 값이 높은 단어의 의미는?",["문서 전체에서 자주 등장하는 일반적 단어","해당 문서에서 중요하고 다른 문서에서는 드문 단어","문서 길이가 짧다","단어 감성이 긍정적"],1,"TF-IDF = TF(문서 내 빈도) × IDF(역문서 빈도). 해당 문서에서 자주 등장하지만 전체 문서에서 드문 단어일수록 높습니다."),
    _Q(21,1,"OLAP(Online Analytical Processing)의 특징으로 옳은 것은?",["실시간 트랜잭션 처리에 최적화","다차원 데이터 분석 및 집계에 특화","비정형 데이터 저장에 사용","실시간 배치 처리 시스템"],1,"OLAP은 다차원 데이터 분석·집계에 특화됩니다. OLTP는 트랜잭션, Hadoop은 비정형 대용량 처리에 적합합니다."),
    _Q(22,1,"데이터 웨어하우스(Data Warehouse)의 특징으로 옳지 않은 것은?",["주제 지향적(Subject-Oriented)","통합적(Integrated)","비휘발성(Non-Volatile)","실시간 트랜잭션 처리에 최적화"],3,"데이터 웨어하우스: 주제 지향, 통합, 비휘발, 시계열 특성. 실시간 트랜잭션(OLTP)과 반대 개념입니다."),
    _Q(23,1,"ETL에서 'Transform(변환)' 단계의 주요 작업은?",["원본 시스템에서 데이터 추출","데이터 정제·형식 변환·통합 처리","목적 시스템에 데이터 적재","데이터 품질 리포트 작성"],1,"T(Transform): 데이터 형식 변환, 중복 제거, 표준화, 비즈니스 규칙 적용 등을 수행합니다."),
    _Q(24,1,"API를 통한 데이터 수집에 대한 설명으로 옳은 것은?",["파일을 직접 다운로드하는 방식","서버가 제공하는 인터페이스를 통해 데이터 요청·수신","DB를 직접 복제하는 방식","웹 크롤링과 동일한 방식"],1,"API는 공식 인터페이스를 통해 JSON/XML 형태로 데이터를 요청·수신하는 방법으로 크롤링보다 안정적입니다."),
    _Q(25,1,"가명처리(Pseudonymization)에 대한 설명으로 옳은 것은?",["개인을 완전히 식별 불가능하게 만드는 처리","추가 정보 없이는 특정 개인을 알아볼 수 없게 처리","원본 데이터를 영구 삭제","암호화와 완전히 동일"],1,"가명처리는 '추가 정보 없이는' 개인을 식별할 수 없게 처리합니다. 익명처리(복원 불가)와 구분됩니다."),
    _Q(26,2,"분석 방법론 단계별 산출물 연결이 옳지 않은 것은?",["문제 정의 → 분석 기획서","데이터 수집 → 원시 데이터셋","모델링 → 학습된 모델","배포 → 비즈니스 요구사항 정의서"],3,"배포 단계 산출물: 배포 모델, 운영 매뉴얼, 모니터링 대시보드. 비즈니스 요구사항 정의서는 문제 정의 단계입니다."),
    _Q(27,2,"분석 과제 우선순위 포트폴리오 매트릭스의 두 축은?",["ROI와 데이터 품질","비즈니스 전략 중요도와 실행 용이성","비용과 시간","팀 역량과 데이터 가용성"],1,"우선순위 매트릭스: 비즈니스 전략 중요도(가치) × 실행 용이성(난이도). QuickWin은 중요도·용이성 모두 높은 영역입니다."),
    _Q(28,2,"분석 투자 '유형 효과(Tangible Benefits)'에 해당하는 것은?",["브랜드 이미지 강화","직원 만족도 향상","연간 비용 절감 500만 원","고객 충성도 증가"],2,"유형 효과는 금액으로 측정 가능합니다. 브랜드 이미지·직원 만족도·고객 충성도는 무형 효과입니다."),
    _Q(29,2,"데이터 거버넌스 정책(Policy)의 역할로 옳은 것은?",["데이터 수집 자동화","데이터 사용에 대한 원칙·규정·기준 수립","데이터 분석 알고리즘 선택","데이터 시각화 도구 관리"],1,"거버넌스 정책은 데이터 소유권, 접근 권한, 품질 기준, 보안 등 전사적 규정을 수립합니다."),
    _Q(30,2,"도메인 지식(Domain Knowledge)의 역할로 옳은 것은?",["프로그래밍 언어 사용","통계 알고리즘 구현","비즈니스 맥락 이해 및 분석 결과의 현실적 해석","DB 관리"],2,"도메인 지식은 분석 결과를 비즈니스 맥락에서 해석하고 실용적 인사이트를 도출하는 데 필수입니다."),
    _Q(31,3,"범주형 변수 간 독립성을 검정하는 통계 방법은?",["t-검정","F-검정","카이제곱(χ²) 검정","Z-검정"],2,"카이제곱 검정은 두 범주형 변수의 독립성을 검정합니다. 성별과 구매 여부, 지역과 선호도 분석에 활용됩니다."),
    _Q(32,3,"부스팅과 배깅의 차이로 옳은 것은?",["부스팅은 병렬 학습, 배깅은 순차 학습","부스팅은 순차적으로 이전 오류에 집중, 배깅은 독립적 병렬 학습","부스팅은 회귀에만, 배깅은 분류에만 사용","둘 다 단일 알고리즘만 사용"],1,"부스팅: 순차 학습(이전 오류 집중). 배깅: 독립적 병렬 학습. AdaBoost·XGBoost=부스팅, Random Forest=배깅입니다."),
    _Q(33,3,"k-fold 교차 검증의 주요 목적은?",["데이터 증강","모델의 일반화 성능을 안정적으로 추정","특성 선택 자동화","하이퍼파라미터 최적화"],1,"k-fold CV는 데이터를 k등분 후 k회 학습·검증 반복하여 편향 없이 일반화 성능을 추정합니다."),
    _Q(34,3,"ROC 곡선의 X축과 Y축으로 올바른 것은?",["정밀도와 재현율","거짓 양성률(FPR)과 진짜 양성률(TPR)","정확도와 F1","임계값과 정확도"],1,"ROC: X=FPR(1-Specificity), Y=TPR(Recall). 왼쪽 상단에 가까울수록 좋은 모델입니다."),
    _Q(35,3,"K-means 군집 분석의 단점으로 옳은 것은?",["군집 수(k) 자동 결정","초기 중심점 선택에 민감","계층적 구조 자동 생성","이상치 자동 제거"],1,"K-means: 초기 중심점에 따라 결과 불안정, k 사전 지정 필요, 구형 군집 가정 등이 단점입니다."),
    _Q(36,3,"Min-Max 정규화의 결과로 옳은 것은?",["평균 0, 표준편차 1","모든 값이 [0, 1] 범위로 변환","이상치 영향 완전 제거","분포가 정규분포로 변환"],1,"Min-Max: (x-min)/(max-min). 결과 [0,1]. 이상치에 민감합니다. Z-score는 평균 0, 표준편차 1입니다."),
    _Q(37,3,"SVM에서 서포트 벡터(Support Vector)의 의미는?",["모든 학습 데이터 포인트","결정 경계와 가장 가까운 데이터 포인트","오분류된 데이터 포인트","가장 멀리 있는 데이터 포인트"],1,"서포트 벡터는 결정 경계와 가장 가까운 데이터 포인트로, 마진을 결정합니다. SVM은 이 마진을 최대화하는 경계를 찾습니다."),
    _Q(38,3,"협업 필터링(CF) 추천의 아이템 기반 방식 특징은?",["사용자 속성 기반 추천","유사 사용자의 구매 패턴 활용","아이템 간 유사도(동시 구매 패턴) 기반 추천","콘텐츠 특성 분석 추천"],2,"아이템 기반 CF는 아이템 간 유사도(동시 구매 패턴)를 활용합니다. 사용자 기반 CF는 유사 사용자 패턴을 활용합니다."),
    _Q(39,3,"계층적 군집 분석의 결과물은?",["군집 레이블 테이블","덴드로그램(Dendrogram)","산점도","박스플롯"],1,"계층적 군집 결과는 덴드로그램으로 표현됩니다. 군집 병합 과정을 트리로 시각화하며 적정 군집 수 결정에 사용됩니다."),
    _Q(40,3,"확률론적 경사 하강법(SGD)의 특징으로 옳은 것은?",["전체 데이터를 한 번에 처리","소수의 샘플로 파라미터를 업데이트","학습률이 고정","배치 경사 하강법보다 항상 정확"],1,"SGD는 미니 배치 또는 단일 샘플로 그래디언트를 추정하여 파라미터를 업데이트합니다. 빠르고 메모리 효율적이나 노이즈가 있습니다."),
  ],
  45: [
    _Q(1,1,"빅데이터의 가치(Value) 창출 방법으로 가장 거리가 먼 것은?",["재사용·재조합을 통한 서비스 개발","데이터 기반 비즈니스 모델 혁신","개인정보 무단 수집 및 판매","이종 데이터 결합으로 인사이트 발굴"],2,"개인정보 무단 수집·판매는 법적으로 금지되며 데이터 윤리에 반합니다."),
    _Q(2,1,"하둡(Hadoop) 에코시스템 중 분산 파일 시스템은?",["MapReduce","HDFS","HBase","Hive"],1,"HDFS(Hadoop Distributed File System)는 대용량 데이터를 여러 노드에 분산 저장하는 파일 시스템입니다."),
    _Q(3,1,"구조적(정형) 데이터로만 구성된 것은?",["이메일·블로그 포스트","관계형 DB 테이블·엑셀 파일","SNS 이미지·동영상","IoT 센서 로그·XML 파일"],1,"관계형 DB와 엑셀은 행·열 구조의 정형 데이터입니다. XML은 반정형, 이미지·동영상은 비정형입니다."),
    _Q(4,1,"정보주체가 개인정보에 대해 갖는 권리가 아닌 것은?",["개인정보 열람 요구권","개인정보 정정·삭제 요구권","처리 정지 요구권","타인 개인정보 무제한 열람권"],3,"정보주체는 자신의 개인정보에 대해 열람·정정·삭제·처리정지·손해배상 청구권을 가집니다."),
    _Q(5,1,"데이터 거버넌스의 주요 목적으로 옳은 것은?",["분석 속도 극대화","데이터 품질·보안·일관성 확보 및 체계적 관리","데이터베이스 성능 튜닝","분석 결과 자동 배포"],1,"데이터 거버넌스는 데이터의 품질, 보안, 프라이버시, 일관성을 체계적으로 관리하는 프레임워크입니다."),
    _Q(6,2,"분석 방법론의 '모델링' 단계에서 수행하는 활동은?",["비즈니스 목표 이해","데이터 수집 및 탐색","알고리즘 선택 및 모델 학습·튜닝","분석 결과 현업 배포"],2,"모델링 단계에서는 적합한 알고리즘 선택, 모델 학습, 하이퍼파라미터 튜닝을 수행합니다."),
    _Q(7,2,"데이터 확보 가능성 측면에서 고려할 사항으로 적절하지 않은 것은?",["내부 데이터 보유 현황 파악","외부 데이터 구매·수집 가능 여부","개인정보 처리 적법성 검토","분석 담당자의 학력 수준"],3,"데이터 확보 가능성: 내부 현황, 외부 수집 가능성, 법적 허용 범위를 고려해야 합니다. 담당자 학력은 무관합니다."),
    _Q(8,2,"데이터 분석 성과 측정에서 재무적 관점의 성과 지표는?",["모델 정확도","분석 프로세스 수행 시간","분석 투자 대비 수익(ROI)","데이터 품질 수준"],2,"ROI(투자수익률)는 분석 투자 비용 대비 실현된 비즈니스 가치를 측정하는 재무적 성과 지표입니다."),
    _Q(9,2,"비즈니스 문제가 명확히 정의된 경우 적합한 분석 접근법은?",["상향식(Bottom-up) 접근법","하향식(Top-down) 접근법","탐색적 데이터 분석","데이터 드리블링"],1,"하향식(Top-down)은 비즈니스 목표가 명확한 '문제 해결형'에 적합합니다. 상향식은 데이터에서 인사이트를 발굴합니다."),
    _Q(10,2,"분석 조직 CoE(Center of Excellence)의 특징으로 옳은 것은?",["각 부서별로 독립 분석팀 운영","전사 분석 전략·방법론·표준을 제공하는 핵심 조직","IT 인프라만 관리","경영진이 직접 분석 수행"],1,"CoE는 전사 분석 방향성, 방법론, 베스트 프랙티스, 표준을 정립하고 현업을 지원하는 중심 조직입니다."),
    _Q(11,3,"이상치(Outlier) 탐지에 사용하지 않는 방법은?",["Z-점수(Z-score) 방법","IQR 기반 방법","박스플롯(Box Plot)","오버샘플링(Oversampling)"],3,"오버샘플링은 불균형 데이터 처리 기법입니다. 이상치 탐지는 Z-score, IQR, 박스플롯, DBSCAN 등을 사용합니다."),
    _Q(12,3,"나이브 베이즈(Naive Bayes) 분류기의 핵심 가정은?",["모든 특성(변수)이 서로 독립","특성 간 강한 상관관계 존재","데이터가 정규분포를 따름","이진 분류에만 적용 가능"],0,"나이브 베이즈는 주어진 클래스에서 모든 특성이 서로 독립이라는 '나이브한' 가정 하에 베이즈 정리를 적용합니다."),
    _Q(13,3,"CNN(Convolutional Neural Network)의 주요 활용 분야는?",["시계열 예측","자연어 처리(NLP)","이미지 인식·분류","군집분석"],2,"CNN은 합성곱 레이어로 이미지의 공간적 특징을 추출하여 이미지 인식·분류·객체 탐지에 특화됩니다."),
    _Q(14,3,"배깅(Bagging)에서 각 모델의 훈련 데이터를 만드는 방식은?",["전체 데이터를 k등분 후 순서대로 사용","중복 허용 부트스트랩(Bootstrap) 샘플링","데이터를 무작위 정렬","전체 데이터를 동일하게 사용"],1,"배깅은 원본 데이터에서 복원 추출(Bootstrap)로 샘플을 만들어 각 모델을 독립적으로 학습합니다."),
    _Q(15,3,"선형 회귀 잔차 분석에서 등분산성 가정을 위반하면 발생하는 문제는?",["다중공선성","이분산성(Heteroscedasticity)","자기상관","잔차 정규성 위반"],1,"이분산성은 잔차의 분산이 일정하지 않은 경우로 OLS 추정량의 효율성을 저하시킵니다. WLS 또는 변환으로 해결합니다."),
    _Q(16,3,"로지스틱 회귀의 오즈비(Odds Ratio)에 대한 설명으로 옳은 것은?",["사건 발생 확률과 미발생 확률의 비율","사건 발생 확률의 절댓값","두 집단의 평균 차이","회귀계수의 표준오차"],0,"오즈(Odds) = P/(1-P), 오즈비(Odds Ratio)는 두 집단의 오즈 비율로 위험 요인의 효과 크기를 나타냅니다."),
    _Q(17,3,"DBSCAN 군집 알고리즘의 특징으로 옳은 것은?",["군집 수(k)를 사전 지정","원형 군집만 탐지 가능","이상치를 노이즈로 자동 분류 가능","계층적 군집화 방법"],2,"DBSCAN은 밀도 기반 알고리즘으로 군집 수 지정 불필요, 다양한 형태 군집 탐지, 이상치 자동 분류가 특징입니다."),
    _Q(18,3,"예측값과 실제값 차이의 절댓값 평균인 회귀 평가 지표는?",["MSE(Mean Squared Error)","MAE(Mean Absolute Error)","RMSE","MAPE"],1,"MAE = (1/n)Σ|y_i - ŷ_i|. 이상치 영향이 MSE보다 적고 원데이터와 같은 단위로 해석이 용이합니다."),
    _Q(19,3,"자연어 처리에서 형태소 분석의 목적은?",["문장의 감정 분석","단어를 의미 있는 최소 단위(형태소)로 분해","문서 간 유사도 계산","개체명(인명·지명) 인식"],1,"형태소 분석은 '나는 학교에 간다' → '나/는/학교/에/가/ㄴ다'처럼 최소 의미 단위로 분해합니다."),
    _Q(20,3,"L2 정규화(Ridge)의 특징으로 옳은 것은?",["일부 계수를 정확히 0으로 만들어 변수 선택","모든 계수를 0 방향으로 줄이되 0이 되지는 않음","계수 제약이 없음","트리 모델에서만 사용 가능"],1,"L2(Ridge)는 계수 제곱합을 패널티로 부여해 0 방향으로 축소하지만 0이 되지는 않습니다. L1(Lasso)은 변수 선택 효과가 있습니다."),
    _Q(21,1,"반정형 데이터(Semi-structured Data)의 예시로 옳은 것은?",["관계형 DB 테이블","JSON·XML 파일","이미지·동영상 파일","바이너리 로그"],1,"반정형 데이터는 스키마가 유연한 JSON, XML, CSV 등입니다. 완전한 구조(관계형 DB)와 비구조(이미지) 사이에 위치합니다."),
    _Q(22,1,"빅데이터 3V 중 Variety(다양성)에 해당하는 예시는?",["하루 10TB 데이터 생성","초당 1000건 트랜잭션 처리","텍스트·이미지·센서 데이터 혼합","분석 결과의 경제적 가치"],2,"Variety는 정형·반정형·비정형 등 다양한 형태의 데이터를 의미합니다."),
    _Q(23,1,"MapReduce에서 'Reduce' 단계의 역할은?",["데이터를 여러 노드에 분산","키-값 쌍으로 데이터 변환","중간 결과를 집계하여 최종 결과 생성","데이터를 네트워크로 전송"],2,"MapReduce: Map(분산 처리, 중간 키-값 생성) → Reduce(중간 결과 집계, 최종 결과 출력)."),
    _Q(24,1,"데이터 카탈로그(Data Catalog)의 주요 기능으로 옳은 것은?",["데이터를 실시간으로 변환","조직의 데이터 자산 목록화 및 메타데이터 관리","데이터 백업 및 복구","데이터 암호화 처리"],1,"데이터 카탈로그는 데이터 자산의 위치·형식·의미·소유자 등 메타데이터를 관리하여 필요한 데이터를 빠르게 찾고 활용하게 합니다."),
    _Q(25,1,"데이터 리니지(Data Lineage)의 의미로 옳은 것은?",["데이터의 법적 소유권","데이터 발생부터 현재까지 이동·변환 경로 추적","데이터 접근 권한 관리","데이터 암호화 알고리즘"],1,"데이터 리니지는 데이터의 출처와 이동·변환 이력을 추적합니다. 품질 문제 디버깅과 규정 준수 감사에 활용됩니다."),
    _Q(26,2,"분석 프로젝트 타당성 검토 항목이 아닌 것은?",["경제적 타당성(비용-편익)","기술적 타당성(역량 수준)","운영적 타당성(조직 역량)","분석가의 개인 선호도"],3,"타당성 검토: 경제적·기술적·운영적·법적 타당성. 개인 선호는 포함되지 않습니다."),
    _Q(27,2,"데이터 스토리텔링의 핵심 요소가 아닌 것은?",["청중 수준에 맞는 언어","핵심 인사이트의 명확한 전달","모든 분석 과정의 상세 설명","시각화를 통한 이해 지원"],2,"스토리텔링: 청중 맞춤 언어, 인사이트 강조, 시각화가 핵심입니다. 모든 과정 상세 설명은 핵심을 가릴 수 있습니다."),
    _Q(28,2,"빅데이터 분석의 '내부 데이터'에 해당하는 것은?",["트위터·인스타그램 게시글","정부 공공 데이터 포털","회사 ERP 시스템 판매 데이터","웹 크롤링 경쟁사 데이터"],2,"내부 데이터: ERP·CRM·POS·내부 DB 등 조직 내부 생성 데이터. 외부 데이터: SNS·공공 데이터·크롤링 등."),
    _Q(29,2,"분석 마스터 플랜 중장기 로드맵 수립의 중요 고려 사항은?",["최신 AI 기술 무조건 도입","현재 분석 수준 진단과 목표 수준 간 GAP 분석","경쟁사 분석 기술 복제","분석 도구 라이선스 비용 최소화"],1,"로드맵: 현재 성숙도(As-Is) → 목표 수준(To-Be) → GAP 분석 → 단계적 실행 계획."),
    _Q(30,2,"KPI 설정 SMART 원칙 중 'A'의 의미는?",["Analytical","Achievable(달성 가능한)","Automated","Accurate"],1,"SMART: Specific·Measurable·Achievable·Relevant·Time-bound. A는 KPI가 현실적으로 달성 가능해야 함을 의미합니다."),
    _Q(31,3,"정규 분포를 따르지 않는 두 독립 집단의 중앙값 비교에 사용하는 검정은?",["독립표본 t-검정","쌍체표본 t-검정","맨-휘트니 U 검정","카이제곱 검정"],2,"맨-휘트니 U 검정은 정규성 가정 없이 두 독립 집단의 중앙값을 비교하는 비모수 검정입니다."),
    _Q(32,3,"특성 중요도(Feature Importance)를 직접 제공하는 알고리즘은?",["K-means","로지스틱 회귀","Random Forest","DBSCAN"],2,"Random Forest는 각 특성이 불순도 감소에 기여한 정도로 특성 중요도를 직접 계산합니다."),
    _Q(33,3,"불균형 데이터 처리 방법이 아닌 것은?",["오버샘플링(SMOTE)","언더샘플링","클래스 가중치 조정","데이터 Min-Max 정규화"],3,"불균형 처리: 오버샘플링·언더샘플링·가중치 조정·임계값 조정. Min-Max 정규화는 불균형 해소 기법이 아닙니다."),
    _Q(34,3,"Random Forest의 특징으로 옳은 것은?",["단일 의사결정나무로 구성","특성 중요도 계산 불가","배깅과 특성 무작위 선택을 결합한 앙상블","과적합에 매우 취약"],2,"Random Forest = 배깅(Bootstrap 샘플) + 특성 무작위 선택. 과적합에 강하고 특성 중요도를 제공합니다."),
    _Q(35,3,"회귀 분석에서 잔차(Residual)의 정의로 옳은 것은?",["모델 파라미터의 합","실제값과 예측값의 차이","독립·종속변수의 상관계수","표준화된 예측값"],1,"잔차 = 실제값 - 예측값. 잔차 분석으로 선형성·등분산성·정규성·독립성 가정을 검토합니다."),
    _Q(36,3,"기울기 소실(Vanishing Gradient) 문제를 완화하는 방법이 아닌 것은?",["ReLU 활성화 함수 사용","배치 정규화","잔차 연결(Residual Connection)","시그모이드 활성화 함수 사용"],3,"시그모이드 함수는 기울기 소실의 원인입니다. ReLU·배치 정규화·잔차 연결이 해결책입니다."),
    _Q(37,3,"딥러닝 레이어가 학습하는 특징으로 옳은 것은?",["고정된 규칙 기반 특징","입력 데이터의 계층적 추상 특징","수동 설계된 특징","단순 선형 변환만"],1,"딥러닝은 저수준(엣지·색상) → 중수준(패턴) → 고수준(객체) 순으로 계층적 특징을 자동 학습합니다."),
    _Q(38,3,"분류 문제와 회귀 문제의 차이로 옳은 것은?",["분류는 연속 출력, 회귀는 이산 출력","분류는 이산 클래스 예측, 회귀는 연속 수치 예측","둘 다 레이블 없이 학습","분류에서만 손실 함수 사용"],1,"분류: 이산 클래스(스팸/정상). 회귀: 연속 수치(집값·온도). 분류는 크로스 엔트로피, 회귀는 MSE 손실 함수를 사용합니다."),
    _Q(39,3,"원-핫 인코딩(One-Hot Encoding)의 목적은?",["연속형 변수 이산화","범주형 변수를 수치형 이진 벡터로 변환","결측값을 평균으로 대체","데이터 정규화"],1,"원-핫 인코딩은 순서 관계 없는 범주형 변수를 알고리즘이 처리할 수 있는 이진 벡터로 변환합니다."),
    _Q(40,3,"자기 회귀 모형(AR: AutoRegressive Model)의 의미는?",["현재 값이 미래 외부 요인에 의해 결정","현재 값이 과거 값들의 선형 조합으로 표현","현재 값이 과거 오차항의 선형 조합","현재 값이 이동 평균으로만 결정"],1,"AR(p): y_t = φ₁y_{t-1} + ... + φₚy_{t-p} + ε. 현재 값이 과거 p개 시점의 자신 값에 의존합니다."),
  ],
  46: [
    _Q(1,1,"빅데이터 플랫폼의 구성 요소가 아닌 것은?",["데이터 수집 레이어","데이터 저장 레이어","데이터 처리·분석 레이어","데이터 자동 삭제 레이어"],3,"빅데이터 플랫폼은 수집→저장→처리·분석→서비스(시각화·배포) 레이어로 구성됩니다."),
    _Q(2,1,"Redis, Memcached 등이 대표적인 NoSQL 유형은?",["문서형(Document)","칼럼형(Column-family)","키-값형(Key-Value)","그래프형(Graph)"],2,"키-값(Key-Value) 방식은 단순하고 빠른 조회에 특화됩니다. Redis·Memcached가 대표적이며 캐싱, 세션 관리에 활용됩니다."),
    _Q(3,1,"데이터 품질 관리 지표가 아닌 것은?",["완전성(Completeness)","정확성(Accuracy)","일관성(Consistency)","복잡성(Complexity)"],3,"데이터 품질 지표: 완전성·정확성·일관성·유효성·유일성·적시성. 복잡성은 품질 관리 지표가 아닙니다."),
    _Q(4,1,"수집되었지만 분석·활용되지 않는 방치된 데이터를 무엇이라 하는가?",["다크 데이터(Dark Data)","스몰 데이터","클린 데이터","마스터 데이터"],0,"다크 데이터는 수집·저장은 되었으나 분석에 활용되지 않는 데이터입니다. 조직 데이터의 80% 이상이 다크 데이터라는 연구도 있습니다."),
    _Q(5,1,"두 변수 간 관계를 점으로 표현하는 시각화 그래프는?",["히스토그램","파이차트","산점도(Scatter Plot)","막대차트"],2,"산점도는 두 연속형 변수의 관계(상관·분포)를 x-y 좌표에 점으로 표현합니다."),
    _Q(6,2,"분석 가설 설정 시 고려 사항으로 옳지 않은 것은?",["검증 가능해야 한다","구체적이어야 한다","기존 이론과 모순되면 무조건 기각","측정 가능한 변수로 구성"],2,"기존 이론과 모순되는 가설도 데이터로 검증하면 새로운 발견이 될 수 있습니다. 가설은 검증 가능·구체적·측정 가능해야 합니다."),
    _Q(7,2,"ROI 산정 시 무형의 효과(Intangible Benefits)에 해당하는 것은?",["비용 절감액","매출 증가액","브랜드 이미지 향상","인건비 감소액"],2,"브랜드 이미지, 고객 만족도, 직원 사기는 측정이 어려운 무형 효과입니다. 비용 절감·매출 증가는 정량적 유형 효과입니다."),
    _Q(8,2,"데이터 표준화가 포함되는 거버넌스 영역은?",["분석 인력 관리","데이터 관리 체계","분석 프로세스 관리","인프라 관리"],1,"데이터 표준화(용어·형식·코드 표준)는 데이터 관리 체계 영역에 포함되며 데이터 일관성 확보에 필수입니다."),
    _Q(9,2,"분석 과제 정의서에 포함되지 않아도 되는 내용은?",["분석 목적 및 목표","데이터 소스 및 가용 데이터","분석 방법론 및 도구","분석가의 개인 취미 및 경력"],3,"분석 과제 정의서: 목적·목표, 데이터 소스, 방법, 기대 효과, 일정·비용, 담당자. 개인 취미는 포함되지 않습니다."),
    _Q(10,2,"애자일(Agile) 분석 방법론의 특징으로 옳은 것은?",["사전에 모든 요구사항을 완벽히 정의","단계별 순차 진행으로 변경 불가","반복적 개선과 빠른 피드백 반영","대규모 팀에서만 효과적"],2,"애자일은 짧은 스프린트(Sprint) 주기로 반복 개선하고 빠른 피드백을 반영하며 변화에 유연하게 대응합니다."),
    _Q(11,3,"판별분석(Discriminant Analysis)의 목적으로 옳은 것은?",["연속형 종속변수 예측","그룹을 가장 잘 구분하는 선형 함수 도출","변수 간 상관관계 탐색","군집 수 결정"],1,"판별분석은 두 개 이상의 집단을 가장 잘 분류하는 판별 함수(선형 결합)를 구하는 지도 학습 기법입니다."),
    _Q(12,3,"AUC(Area Under the Curve) 값이 0.5일 때의 의미는?",["완벽한 분류 성능","무작위 분류와 동일한 성능","최악의 분류 성능","과적합 상태"],1,"AUC=1: 완벽, AUC=0.5: 무작위 분류(동전 던지기)와 동등, AUC<0.5: 무작위보다 나쁜 분류입니다."),
    _Q(13,3,"RNN(Recurrent Neural Network)의 특징으로 옳은 것은?",["이미지 데이터에 특화","순서 있는 시계열·텍스트 데이터에 적합","피드백 연결이 없는 순방향 신경망","군집 분석에 주로 사용"],1,"RNN은 이전 단계의 출력을 다음 단계의 입력으로 사용하는 순환 구조로 시계열·자연어에 적합합니다."),
    _Q(14,3,"의사결정나무에서 가지치기(Pruning)를 수행하는 이유는?",["학습 속도 향상","훈련 정확도를 무조건 높이기 위해","과적합 방지 및 일반화 성능 향상","훈련 데이터 수 증가"],2,"가지치기는 트리의 불필요한 가지를 제거하여 과적합을 방지하고 새 데이터에 대한 일반화 성능을 높입니다."),
    _Q(15,3,"비모수적 통계 검정에 해당하는 것은?",["독립표본 t-검정","대응표본 t-검정","일원분산분석(ANOVA)","맨-휘트니 U 검정"],3,"맨-휘트니 U 검정은 정규분포 가정이 불필요한 비모수 검정으로 두 독립 집단의 중앙값을 비교합니다."),
    _Q(16,3,"다중 선형 회귀에서 VIF 값이 10 이상이면?",["정규성 위반","심각한 다중공선성 가능성","등분산성 위반","자기상관 문제"],1,"VIF는 다중공선성 진단 지표. 일반적으로 VIF>10이면 심각한 다중공선성으로 간주합니다."),
    _Q(17,3,"텍스트에서 긍정·부정·중립 감정을 자동 분류하는 기법은?",["시계열 추세 분석","이미지 객체 탐지","감성 분석(Sentiment Analysis)","군집분석"],2,"감성 분석은 리뷰·SNS 텍스트 등에서 작성자의 감정(긍정/부정/중립)을 자동으로 분류하는 NLP 기법입니다."),
    _Q(18,3,"분류 문제의 손실 함수로 사용되는 교차 엔트로피(Cross-Entropy)에 대한 설명으로 옳은 것은?",["회귀 문제에 주로 사용","예측 확률 분포와 실제 분포의 차이를 측정","군집 수를 결정하는 기준","이상치 탐지에 특화"],1,"크로스 엔트로피는 분류 문제에서 예측 확률 분포와 실제 분포의 차이를 측정하는 손실 함수입니다."),
    _Q(19,3,"scikit-learn에서 모델을 학습시키는 메서드는?",["predict()","fit()","transform()","evaluate()"],1,"scikit-learn에서 fit()은 모델 학습, predict()는 예측, transform()은 데이터 변환, score()는 성능 평가입니다."),
    _Q(20,3,"빅데이터 배치 이동 도구로 HDFS와 관계형 DB 간 데이터를 전송하는 것은?",["Apache Kafka","Apache Flink","Apache Spark Streaming","Apache Sqoop"],3,"Apache Sqoop은 HDFS와 RDBMS 간 데이터를 배치로 이동합니다. Kafka·Flink·Spark Streaming은 실시간 스트리밍 처리 프레임워크입니다."),
    _Q(21,1,"데이터 거버넌스 평가 기준 중 데이터 값이 정의된 규칙과 형식을 따르는지를 나타내는 품질 지표는?",["정확성(Accuracy)","완전성(Completeness)","유효성(Validity)","유일성(Uniqueness)"],2,"유효성은 데이터가 사전 정의된 규칙·형식·범위를 준수하는지 여부입니다. 예) 날짜 형식 YYYY-MM-DD, 나이 0~150."),
    _Q(22,1,"하둡(Hadoop) 에코시스템 중 HBase의 특징으로 옳은 것은?",["SQL 기반 관계형 데이터베이스","HDFS 위에서 동작하는 분산 칼럼형 NoSQL","실시간 스트림 처리 엔진","데이터 워크플로우 스케줄러"],1,"HBase는 HDFS 위에서 동작하는 분산 칼럼 기반 NoSQL DB로 대용량 희소 데이터를 빠르게 읽고 씁니다."),
    _Q(23,1,"데이터 마이닝에서 연관 규칙(Association Rule)의 지지도(Support) 공식은?",["P(A) × P(B)","P(A∩B) / P(B)","P(A∩B) / 전체 거래 수","P(B|A) / P(B)"],2,"지지도 = P(A∩B) = (A와 B 동시 포함 거래 수) / (전체 거래 수). 규칙의 빈도 수준을 나타냅니다."),
    _Q(24,1,"Parquet, ORC 파일 형식의 장점으로 옳은 것은?",["인간이 직접 읽기 용이","열 기반 저장으로 집계 쿼리 성능 우수","실시간 쓰기 최적화","관계형 DB에서 직접 사용 가능"],1,"Parquet·ORC는 열 기반(Columnar) 저장 포맷으로 집계·분석 쿼리 시 필요한 컬럼만 읽어 I/O와 저장 공간을 절약합니다."),
    _Q(25,1,"클라우드 서비스 모델 중 플랫폼(PaaS)에 해당하는 것은?",["AWS EC2(가상 서버)","AWS S3(스토리지)","Google App Engine","Microsoft Office 365"],2,"PaaS: 개발 환경·런타임·미들웨어 제공(Google App Engine, Heroku). IaaS: 인프라(EC2, S3). SaaS: 소프트웨어(Office 365)."),
    _Q(26,2,"비즈니스 가치 관점에서 분석 과제 우선순위를 결정할 때 고려 요소가 아닌 것은?",["기대 ROI","구현 난이도","데이터 가용성","분석가 생년월일"],3,"우선순위 결정: 기대 ROI·전략 중요도·구현 난이도·데이터 가용성·긴급성. 개인 신상 정보는 해당 없습니다."),
    _Q(27,2,"하향식(Top-Down) 분석 기획의 특징으로 옳은 것은?",["현업 데이터 탐색으로 과제 발굴","경영 전략·목표 중심으로 분석 과제 정의","분석가 개인 흥미 위주 탐색","데이터 가용성 먼저 확인 후 전략 수립"],1,"하향식: 전략 목표 → 핵심 질문 → 분석 과제 도출. 상향식: 데이터 탐색 → 패턴 발견 → 비즈니스 가치 연결."),
    _Q(28,2,"데이터 분석 결과 보고서의 핵심 독자(경영진)에게 적합한 보고 방식은?",["모든 알고리즘 수식 상세 기술","수백 페이지 분량의 기술 문서","핵심 인사이트와 비즈니스 의미 중심 요약","원시 데이터 전체 첨부"],2,"경영진 보고: 핵심 결론과 비즈니스 의미를 한눈에 파악할 수 있도록 간결하게 요약합니다."),
    _Q(29,2,"분석 환경 구성 시 개발·스테이징·운영 환경을 분리하는 이유는?",["비용 절감","테스트 안전성 확보 및 운영 안정성 유지","분석가 학습 용이","데이터 중복 방지"],1,"환경 분리: 개발(자유 실험) → 스테이징(운영 전 최종 검증) → 운영(실서비스). 운영 환경 보호와 품질 확보."),
    _Q(30,2,"분석 과제의 KPI를 설정할 때 '측정 가능성(Measurable)'이 의미하는 바는?",["담당자가 측정 결과를 이해할 수 있음","수치·지표로 진행 정도를 객관적으로 파악 가능","측정 도구가 자동화되어 있음","측정 비용이 낮음"],1,"측정 가능성은 진행 정도와 달성 여부를 수치·지표로 객관적으로 확인할 수 있어야 함을 의미합니다."),
    _Q(31,3,"시계열 데이터의 분해(Decomposition) 구성 요소가 아닌 것은?",["추세(Trend)","계절성(Seasonality)","잔차(Residual)","클러스터(Cluster)"],3,"시계열 분해: 추세(장기 방향성) + 계절성(주기 패턴) + 순환(장기 경기) + 잔차(불규칙 요소). 클러스터는 군집 분석 개념입니다."),
    _Q(32,3,"딥러닝의 배치 정규화(Batch Normalization)의 효과로 옳은 것은?",["모델 파라미터 수 감소","각 레이어 입력 분포를 안정화하여 학습 속도 향상","데이터 증강(Augmentation)","이상치 자동 제거"],1,"배치 정규화는 미니배치 단위로 레이어 입력 분포(평균 0, 분산 1)를 정규화하여 내부 공변량 이동을 줄이고 학습을 빠르게 합니다."),
    _Q(33,3,"SVM(Support Vector Machine)에서 마진(Margin)이란?",["학습률(Learning Rate)","결정 경계와 가장 가까운 데이터 포인트 사이의 거리","손실 함수 값","히든 레이어 수"],1,"SVM은 클래스 사이의 마진(결정 경계와 서포트 벡터 간 거리)을 최대화하는 결정 경계를 찾습니다."),
    _Q(34,3,"다음 중 앙상블(Ensemble) 학습 기법에 해당하지 않는 것은?",["배깅(Bagging)","부스팅(Boosting)","스태킹(Stacking)","드롭아웃(Dropout)"],3,"드롭아웃은 신경망의 정규화 기법입니다. 배깅·부스팅·스태킹은 대표적인 앙상블 기법입니다."),
    _Q(35,3,"k-겹 교차검증(k-fold Cross Validation)의 k값이 클수록 나타나는 현상은?",["학습 데이터 비율 감소","검증 신뢰도 향상, 계산 비용 증가","과적합 증가","모델 단순화"],1,"k가 클수록 더 많은 데이터로 학습하고 더 적은 데이터로 검증하므로 분산이 줄고 신뢰도가 올라가지만 k배의 계산 비용이 듭니다."),
    _Q(36,3,"데이터 증강(Data Augmentation) 기법이 주로 사용되는 분야는?",["정형 데이터 회귀 분석","시계열 ARIMA 모델링","이미지·텍스트 딥러닝","SQL 쿼리 최적화"],2,"데이터 증강은 이미지(회전·반전·색상 조정)나 텍스트(동의어 교체) 등 비정형 딥러닝에서 훈련 데이터를 인위적으로 늘리는 기법입니다."),
    _Q(37,3,"Precision(정밀도)와 Recall(재현율)의 관계로 옳은 것은?",["항상 동일한 값","임계값 변화에 따라 트레이드오프 관계","Precision이 높으면 Recall도 항상 높음","서로 독립적으로 동시에 최대화 가능"],1,"임계값을 높이면 Precision↑ Recall↓, 낮추면 Precision↓ Recall↑. 두 지표는 트레이드오프 관계입니다."),
    _Q(38,3,"DBSCAN 클러스터링 알고리즘의 특징으로 옳은 것은?",["구형 군집에만 적합","클러스터 수를 미리 지정해야 함","임의 형태 군집 탐지 및 노이즈 포인트 처리 가능","거리 기반 유사도만 사용"],2,"DBSCAN: 밀도 기반 군집. 클러스터 수 자동 결정, 비구형 군집 탐지, 노이즈(이상치) 자동 분류."),
    _Q(39,3,"회귀 모형의 성능 평가 지표 RMSE(Root Mean Squared Error)의 특징은?",["오차를 절댓값으로 처리","큰 오차에 민감하며 원래 단위와 같음","분류 문제에 사용","값이 클수록 성능이 좋음"],1,"RMSE는 오차의 제곱 평균의 제곱근으로 큰 오차에 더 민감합니다. 단위가 원래 변수와 같아 해석이 직관적입니다."),
    _Q(40,3,"GAN(Generative Adversarial Network)에서 두 신경망의 역할로 옳은 것은?",["인코더는 압축, 디코더는 복원","생성자는 가짜 데이터 생성, 판별자는 진위 여부 판별","정책망과 가치망의 협력","분류기와 회귀기의 앙상블"],1,"GAN: 생성자(Generator)는 실제 같은 가짜 데이터를 생성하고, 판별자(Discriminator)는 진짜와 가짜를 구별합니다. 경쟁을 통해 품질이 향상됩니다."),
  ],
  47: [
    _Q(1,1,"정형·반정형·비정형 데이터를 원본 형태로 저장하는 저장소는?",["데이터 마트(Data Mart)","데이터 레이크(Data Lake)","데이터 웨어하우스(DW)","운영 DB(OLTP)"],1,"데이터 레이크는 원본 형태 그대로 다양한 유형의 데이터를 저장합니다. ELT 방식을 사용하며 분석 유연성이 높습니다."),
    _Q(2,1,"IoT 데이터의 특성으로 가장 거리가 먼 것은?",["대용량 연속 생성","실시간성","고정된 정형 데이터 구조","다양한 기기에서 이기종 데이터 발생"],2,"IoT 데이터는 다양한 센서에서 비정형·반정형 형태로 발생합니다. 고정된 정형 데이터라기보다 이기종·연속적 특성이 있습니다."),
    _Q(3,1,"전사 아키텍처에서 데이터 아키텍처의 역할로 옳은 것은?",["네트워크 인프라 설계","조직 전체의 데이터 자산을 체계적으로 관리·설계","애플리케이션 개발 방법론 정의","보안 정책 수립"],1,"데이터 아키텍처는 데이터 모델·흐름·저장·관리 체계를 설계하여 전사적 데이터 자산을 체계화합니다."),
    _Q(4,1,"개인정보 비식별 조치 후 재식별 위험을 점검하는 기준이 아닌 것은?",["K-익명성 충족 여부","L-다양성 충족 여부","T-근접성 충족 여부","데이터 암호화 후 원문 삭제"],3,"재식별 위험 점검: K-익명성, L-다양성, T-근접성 기준으로 평가합니다. 암호화 후 원문 삭제는 비식별화가 아닌 삭제 처리입니다."),
    _Q(5,1,"데이터 3계층 구조에서 운영 시스템과 데이터 웨어하우스 사이에 위치하는 계층은?",["데이터 마트","데이터 레이크","ODS(Operational Data Store)","데이터 카탈로그"],2,"계층: 운영 시스템(OLTP) → ODS(원본 정제·통합) → 데이터 웨어하우스 → 데이터 마트 순입니다."),
    _Q(6,2,"반복 점진적(Iterative & Incremental) 개발 방법의 특징으로 옳은 것은?",["요구사항을 완전히 정의 후 순차 진행","잦은 피드백을 반영하며 점진적으로 개선","변경 비용이 항상 최소화됨","대규모 폭포수 모델과 동일"],1,"반복 점진적 방법은 짧은 사이클로 기능을 개발·검증하고 피드백을 반영해 점진적으로 완성합니다. Scrum·Agile이 대표적입니다."),
    _Q(7,2,"분석 과제 우선순위 매트릭스에서 'Quick Win' 영역의 특징은?",["비즈니스 가치 낮고 실행 어려움","비즈니스 가치 높고 실행 어려움","비즈니스 가치 높고 실행 쉬움","비즈니스 가치 낮고 실행 쉬움"],2,"Quick Win은 비즈니스 가치(전략적 중요도)와 실행 용이성이 모두 높은 영역으로 우선 추진합니다."),
    _Q(8,2,"외부 데이터 획득 방법이 아닌 것은?",["공공 데이터 포털 활용","오픈 API를 통한 데이터 수집","내부 ERP 시스템에서 데이터 추출","웹 크롤링으로 데이터 수집"],2,"ERP·CRM·POS 등 사내 시스템은 내부 데이터 소스입니다. 공공 포털·API·크롤링은 외부 데이터 수집 방법입니다."),
    _Q(9,2,"모델 배포(Deployment) 단계에서 가장 중요한 고려 사항은?",["모델 학습 알고리즘 선택","데이터 수집 방법론","운영 환경 성능 모니터링 및 재학습 주기","탐색적 데이터 분석 방법"],2,"배포 단계에서는 실제 운영에서 모델 성능 저하(Model Drift) 여부 모니터링과 주기적 재학습(Retraining) 계획이 필요합니다."),
    _Q(10,2,"데이터 품질 관리·메타데이터 관리·데이터 표준 준수를 담당하는 역할은?",["데이터 사이언티스트","비즈니스 애널리스트","데이터 스튜어드(Data Steward)","IT 아키텍트"],2,"데이터 스튜어드는 데이터 품질, 메타데이터, 표준, 정의 등 데이터 거버넌스 실무를 담당합니다."),
    _Q(11,3,"분산(Variance)-편향(Bias) 트레이드오프에서 복잡한 모델의 특성은?",["분산 낮고 편향 낮다","분산 낮고 편향 높다","분산 높고 편향 낮다","분산 높고 편향 높다"],2,"복잡 모델: 높은 분산(Overfitting) + 낮은 편향. 단순 모델: 낮은 분산 + 높은 편향(Underfitting)입니다."),
    _Q(12,3,"병렬 처리와 L1/L2 정규화를 지원하는 그래디언트 부스팅 알고리즘은?",["AdaBoost","XGBoost","GBM(Gradient Boosting Machine)","LightGBM"],1,"XGBoost는 그래디언트 부스팅에 병렬 처리, L1/L2 정규화, 결측값 처리, 조기 종료 등을 추가한 고성능 알고리즘입니다."),
    _Q(13,3,"소수 클래스의 데이터를 합성하여 불균형을 해소하는 기법은?",["언더샘플링(Undersampling)","SMOTE","클래스 가중치 조정","임계값(Threshold) 조정"],1,"SMOTE(Synthetic Minority Oversampling Technique)는 소수 클래스 기존 샘플을 기반으로 합성 샘플을 생성하는 오버샘플링 기법입니다."),
    _Q(14,3,"단어를 의미적 유사성이 반영된 고차원 벡터로 표현하는 기법은?",["이미지 임베딩","Word2Vec","감성 분석","TF-IDF"],1,"Word2Vec은 단어를 밀집 벡터(Dense Vector)로 표현하여 의미적으로 유사한 단어가 벡터 공간에서 가까이 위치하도록 학습합니다."),
    _Q(15,3,"F1-Score를 구하는 공식으로 옳은 것은?",["(TP+TN)/(TP+FP+FN+TN)","2×(Precision×Recall)/(Precision+Recall)","TP/(TP+FN)","TP/(TP+FP)"],1,"F1 = 2PR/(P+R). 정밀도(Precision)와 재현율(Recall)의 조화 평균으로 불균형 데이터에서 유용합니다."),
    _Q(16,3,"PCA에서 주성분 수를 선택하는 일반적인 기준은?",["고유값이 1 이하인 성분 선택","설명 분산 누적 비율이 70~90%가 되는 수","주성분 수=원래 변수 수","고유벡터 부호가 양수인 성분만"],1,"PCA 주성분 수: 설명 분산 누적 비율(80~90%), 스크리 도표(Scree Plot) 꺾임점, 고유값>1 기준을 활용합니다."),
    _Q(17,3,"출력층에서 회귀 문제에 사용하는 활성화 함수는?",["ReLU","Sigmoid","Softmax","선형(Identity) 함수"],3,"선형(Identity) f(x)=x는 회귀 출력층에 사용됩니다. Sigmoid는 이진 분류, Softmax는 다중 분류, ReLU는 은닉층에 사용됩니다."),
    _Q(18,3,"군집 내 응집도와 군집 간 분리도를 동시에 측정하는 군집 타당성 지표는?",["엘보우 방법(Elbow Method)","실루엣 계수(Silhouette Coefficient)","덴드로그램(Dendrogram)","갭 통계량(Gap Statistic)"],1,"실루엣 계수 = (b-a)/max(a,b). a=군집 내 평균 거리, b=가장 가까운 다른 군집 평균 거리. -1~1 사이로 1에 가까울수록 좋습니다."),
    _Q(19,3,"이항분포 B(n, p)의 평균(기댓값)은?",["p","np","np(1-p)","√(np(1-p))"],1,"이항분포 B(n, p)의 평균 = np, 분산 = np(1-p), 표준편차 = √(np(1-p))입니다."),
    _Q(20,3,"모델 설명 가능성(Explainability)이 가장 높은 알고리즘은?",["Random Forest","Deep Neural Network","로지스틱 회귀(Logistic Regression)","Gradient Boosting"],2,"로지스틱 회귀는 계수(coefficient)의 의미를 직접 해석할 수 있어 설명 가능성이 높습니다. 앙상블·딥러닝은 블랙박스 모델입니다."),
    _Q(21,1,"실시간 스트리밍 데이터 처리를 위한 대표적인 플랫폼은?",["Apache Sqoop","Apache Kafka","Apache Hive","Apache Oozie"],1,"Apache Kafka는 대용량 실시간 스트리밍 데이터 처리 플랫폼입니다. Sqoop은 배치 이동, Hive는 배치 쿼리, Oozie는 워크플로우 스케줄러입니다."),
    _Q(22,1,"데이터 표준화(Standardization) 결과 데이터의 분포 특성은?",["최소값 0, 최대값 1","평균 0, 표준편차 1","모든 값이 양수","데이터 분포 형태가 정규분포로 변환"],1,"표준화(Z-score normalization): (x-μ)/σ → 평균 0, 표준편차 1. 정규분포 형태 자체를 바꾸지는 않습니다."),
    _Q(23,1,"그래프 데이터베이스(Graph DB)의 대표적인 활용 사례는?",["거래 내역 배치 집계","소셜 네트워크 관계 분석·추천","행렬 연산 가속","로그 파일 압축 저장"],1,"그래프 DB(Neo4j 등)는 노드·엣지·속성으로 관계 데이터를 저장하며 소셜 네트워크·추천·지식 그래프에 활용됩니다."),
    _Q(24,1,"개인정보 중 특별히 민감하여 처리 시 별도 동의가 필요한 '민감 정보'에 해당하지 않는 것은?",["유전자 정보","범죄 경력","주민등록번호","사상·신념"],2,"개인정보보호법 민감 정보: 사상·신념, 노동조합·정당 가입, 건강·성생활, 유전자, 범죄 경력 등. 주민등록번호는 고유식별정보입니다."),
    _Q(25,1,"데이터 웨어하우스에서 특정 주제나 부서를 위해 만든 소규모 데이터 집합소는?",["데이터 레이크","데이터 마트(Data Mart)","ODS","마스터 데이터"],1,"데이터 마트는 특정 부서(영업·마케팅 등)나 주제를 위해 DW의 일부를 부분적으로 추출한 소규모 데이터 저장소입니다."),
    _Q(26,2,"분석 성숙도 모델(Analytics Maturity Model)의 가장 높은 단계는?",["기술적 분석(Descriptive Analytics)","진단적 분석(Diagnostic Analytics)","예측적 분석(Predictive Analytics)","처방적 분석(Prescriptive Analytics)"],3,"성숙도: 기술(무슨 일이?) → 진단(왜?) → 예측(어떻게 될까?) → 처방(어떻게 해야 하나?). 처방적 분석이 최상위입니다."),
    _Q(27,2,"분석 과제 범위(Scope) 정의 시 주의할 점으로 옳은 것은?",["가능한 많은 변수와 문제를 포함","분석 목적에 집중된 명확한 경계 설정","비즈니스 맥락 고려 불필요","예산 산정 후 범위 결정"],1,"범위 정의: 분석 목적에 집중된 명확한 경계, 현실적인 시간·자원 제약, 이해관계자 합의가 중요합니다."),
    _Q(28,2,"데이터 기반 의사결정에서 '확증 편향(Confirmation Bias)'의 위험은?",["데이터 수집 비용 증가","기존 믿음을 지지하는 데이터만 선택적으로 사용","모델 학습 속도 저하","분석 결과가 항상 정확해짐"],1,"확증 편향은 기존 가설·믿음을 지지하는 증거만 선택적으로 수용하여 객관적 분석을 방해합니다."),
    _Q(29,2,"분석 현업 부서에 데이터 분석 능력을 확산하는 '데이터 민주화(Data Democratization)'의 목적은?",["데이터를 소수 전문가만 독점","모든 구성원이 데이터에 쉽게 접근·활용하도록 지원","보안을 위해 데이터 접근 제한","데이터 분석 결과 외부 공개"],1,"데이터 민주화는 셀프서비스 분석 도구와 교육을 통해 현업이 스스로 데이터를 활용할 수 있게 합니다."),
    _Q(30,2,"분석 결과 현업 반영을 위한 변화 관리(Change Management)에서 가장 중요한 것은?",["최고 성능의 알고리즘 선택","이해관계자 소통·교육·저항 관리","데이터 수집량 증가","모델 재학습 자동화"],1,"분석 결과 도입 성패는 이해관계자 소통, 사용자 교육, 조직 저항 관리 등 변화 관리에 달려 있습니다."),
    _Q(31,3,"주성분 분석(PCA)의 결과로 생성되는 주성분들의 특성은?",["원래 변수와 동일한 의미","서로 직교(uncorrelated)하며 분산 설명력 내림차순","상관 관계가 강한 성분","모두 동일한 분산 설명력"],1,"PCA 주성분: 서로 직교(상관 없음), 분산 설명력 내림차순(PC1>PC2>...), 원래 변수의 선형 결합입니다."),
    _Q(32,3,"의사결정나무에서 불순도 측정에 사용되는 지니 지수(Gini Index)의 범위는?",["[-1, 1]","[0, 1]","[0, 0.5]","[0, ∞)"],1,"지니 지수 범위 [0, 1-1/k]. 이진 분류에서 [0, 0.5]. 0에 가까울수록 순수(같은 클래스)를 의미합니다."),
    _Q(33,3,"시계열 예측에서 ARIMA(p,d,q)의 'p' 파라미터의 의미는?",["이동 평균 차수","차분(Differencing) 횟수","자기 회귀(AR) 항의 차수","계절성 주기"],2,"ARIMA(p,d,q): p=AR(자기회귀) 차수, d=차분 횟수, q=MA(이동평균) 차수입니다."),
    _Q(34,3,"딥러닝 학습 시 과적합 방지를 위해 학습 중 일부 노드를 무작위로 비활성화하는 기법은?",["배치 정규화","드롭아웃(Dropout)","L1 정규화","조기 종료"],1,"드롭아웃은 학습 시 무작위로 노드를 비활성화하여 앙상블 효과를 통해 과적합을 방지합니다."),
    _Q(35,3,"Gradient Boosting에서 각 트리가 학습하는 것은?",["이전 트리들의 평균","이전 모델들의 잔차(Residual)","전체 데이터의 부트스트랩 샘플","무작위 특성 부분집합"],1,"그래디언트 부스팅은 각 새로운 트리가 이전 모델의 잔차(오차)를 학습하여 순차적으로 오차를 줄입니다."),
    _Q(36,3,"K-means 클러스터링 초기화 방법 K-means++의 목적은?",["k 값 자동 선택","초기 중심점을 멀리 분산되도록 선택하여 수렴 안정화","연산 속도 최대화","비구형 군집 처리"],1,"K-means++는 초기 중심점을 거리 비례 확률로 멀리 선택하여 수렴 안정성을 높이고 지역 최솟값 함정을 줄입니다."),
    _Q(37,3,"혼동 행렬(Confusion Matrix)에서 FP(False Positive)의 의미는?",["실제 양성을 양성으로 올바르게 예측","실제 음성을 양성으로 잘못 예측","실제 양성을 음성으로 잘못 예측","실제 음성을 음성으로 올바르게 예측"],1,"FP = 실제는 음성(Negative)인데 양성(Positive)으로 잘못 예측. Type I 오류(1종 오류)라고도 합니다."),
    _Q(38,3,"회귀 분석에서 독립변수가 1 단위 증가할 때 종속변수의 변화량을 나타내는 것은?",["절편(Intercept)","회귀계수(Regression Coefficient)","결정계수(R²)","잔차(Residual)"],1,"회귀계수는 독립변수 1 단위 증가 시 종속변수의 평균적 변화량입니다. 양수이면 정비례, 음수이면 반비례 관계입니다."),
    _Q(39,3,"교차 검증(Cross Validation)의 주요 목적으로 옳은 것은?",["학습 속도 향상","데이터 증강","일반화 성능 신뢰성 있게 추정","모델 파라미터 수 감소"],2,"교차 검증은 데이터를 여러 방식으로 분할하여 모델 성능을 다양한 데이터 부분집합에서 측정해 일반화 성능을 신뢰성 있게 추정합니다."),
    _Q(40,3,"데이터 파이프라인의 자동화·버전 관리·모니터링·재학습을 포함하는 실무 체계는?",["ETL 자동화","MLOps(Machine Learning Operations)","데이터 스튜어드십","CI/CD(소프트웨어)"],1,"MLOps는 ML 모델 개발(Dev)과 운영(Ops)을 통합하여 모델 배포·모니터링·재학습·버전 관리를 자동화합니다."),
  ],
  48: [
    _Q(1,1,"학습 데이터의 패턴을 학습해 새로운 텍스트·이미지 등을 생성하는 AI는?",["판별형 AI","생성형 AI(Generative AI)","규칙 기반 AI","강화 학습 AI"],1,"생성형 AI는 GPT·Stable Diffusion처럼 학습 데이터 패턴으로 새로운 콘텐츠를 생성합니다."),
    _Q(2,1,"GPT, BERT 등 대규모 언어 모델(LLM)의 기반이 되는 딥러닝 구조는?",["CNN(합성곱 신경망)","RNN(순환 신경망)","트랜스포머(Transformer)","GAN(생성적 적대 신경망)"],2,"트랜스포머는 셀프 어텐션 메커니즘 기반으로 GPT·BERT·T5 등 LLM의 기반 구조입니다."),
    _Q(3,1,"데이터를 읽고 해석하며 비판적으로 분석하고 활용하는 능력은?",["데이터 엔지니어링","데이터 리터러시(Data Literacy)","데이터 스튜어드십","데이터 아키텍처"],1,"데이터 리터러시는 데이터를 올바르게 읽고·해석하고·활용하고·비판적으로 평가하는 현대 사회의 핵심 역량입니다."),
    _Q(4,1,"분석 플랫폼·미들웨어를 서비스로 제공하는 클라우드 모델은?",["IaaS(Infrastructure as a Service)","PaaS(Platform as a Service)","SaaS(Software as a Service)","DaaS(Data as a Service)"],1,"PaaS는 운영체제·미들웨어·개발 플랫폼을 서비스로 제공합니다. IaaS는 인프라, SaaS는 완성된 소프트웨어를 제공합니다."),
    _Q(5,1,"원본 데이터를 중앙으로 보내지 않고 각 기기에서 로컬 학습 후 모델 파라미터만 공유하는 기법은?",["전이 학습(Transfer Learning)","연합 학습(Federated Learning)","능동 학습(Active Learning)","메타 학습(Meta Learning)"],1,"연합 학습은 디바이스에서 로컬 학습 후 파라미터(모델 업데이트)만 공유하여 개인정보를 보호합니다."),
    _Q(6,2,"데이터 메시(Data Mesh)의 핵심 원칙이 아닌 것은?",["도메인 중심 데이터 소유권","셀프서비스 데이터 플랫폼","중앙화된 단일 데이터 팀","데이터 제품(Data Product) 개념"],2,"데이터 메시는 탈중앙화, 셀프서비스, 연합 거버넌스가 핵심입니다. 중앙화된 단일 팀은 데이터 메시의 반대 개념입니다."),
    _Q(7,2,"전체 투자 전에 아이디어의 실현 가능성을 소규모로 검증하는 단계는?",["완성 제품 출시","PoC(Proof of Concept)","데이터 수집 비용 절감","알고리즘 최종 확정"],1,"PoC는 소규모로 기술적·비즈니스적 실현 가능성을 빠르게 검증하여 위험을 줄이고 의사결정을 지원합니다."),
    _Q(8,2,"MLOps의 주요 구성 요소가 아닌 것은?",["모델 버전 관리","자동화된 ML 파이프라인(CI/CD)","모델 성능 모니터링","데이터 수집 하드웨어 제작"],3,"MLOps: 데이터/모델 버전 관리, CI/CD 파이프라인, 모델 모니터링·재학습·배포 자동화가 핵심입니다."),
    _Q(9,2,"조직 내 데이터 자산을 목록화하고 메타데이터를 관리하여 검색·발견을 지원하는 도구는?",["데이터 파이프라인","데이터 카탈로그(Data Catalog)","데이터 레이크하우스","ETL 도구"],1,"데이터 카탈로그는 데이터 자산을 목록화하고 메타데이터를 관리하여 사용자가 필요한 데이터를 빠르게 찾을 수 있도록 합니다."),
    _Q(10,2,"기존 서버의 CPU·메모리 등 하드웨어 사양을 업그레이드하는 확장 방식은?",["수평 확장(Scale-Out)","수직 확장(Scale-Up)","분산 확장","클라우드 확장"],1,"수직 확장(Scale-Up)은 단일 서버의 사양을 강화합니다. 수평 확장(Scale-Out)은 서버 대수를 추가합니다."),
    _Q(11,3,"이상 탐지(Anomaly Detection)에 사용되지 않는 알고리즘은?",["Isolation Forest","One-Class SVM","Autoencoder","LDA(Linear Discriminant Analysis)"],3,"LDA는 지도 학습 기반 판별분석입니다. Isolation Forest, One-Class SVM, Autoencoder, LOF 등이 이상 탐지에 활용됩니다."),
    _Q(12,3,"트랜스포머의 어텐션 메커니즘의 주요 역할은?",["이미지 공간적 특징 추출","입력 시퀀스에서 중요한 부분에 가중치를 부여","데이터 차원 축소","군집 간 거리 계산"],1,"어텐션은 입력 시퀀스 내 각 위치 간 관계를 계산하여 현재 출력에 가장 관련 있는 입력에 높은 가중치를 부여합니다."),
    _Q(13,3,"소량의 레이블 데이터와 대량의 비레이블 데이터를 함께 사용하는 학습 방법은?",["지도 학습","비지도 학습","준지도 학습(Semi-supervised Learning)","강화 학습"],2,"준지도 학습은 레이블 확보 비용을 줄이면서 비레이블 데이터의 구조적 정보를 활용하여 성능을 향상시킵니다."),
    _Q(14,3,"각 배치의 출력을 정규화하여 학습을 안정화하는 딥러닝 기법은?",["드롭아웃(Dropout)","배치 정규화(Batch Normalization)","L2 정규화","조기 종료(Early Stopping)"],1,"배치 정규화는 각 배치의 출력을 정규화하여 내부 공변량 이동(Internal Covariate Shift)을 줄이고 학습 속도를 향상시킵니다."),
    _Q(15,3,"고차원 데이터를 2~3차원으로 시각화하는 차원 축소 기법은?",["PCA","t-SNE","LDA","UMAP"],1,"t-SNE는 고차원 데이터의 유사성을 보존하면서 2D·3D로 투영해 시각화하는 데 사용됩니다. (UMAP도 유사 목적)"),
    _Q(16,3,"강화 학습(Reinforcement Learning)의 구성 요소가 아닌 것은?",["에이전트(Agent)","환경(Environment)","보상(Reward)","레이블(Label)"],3,"강화 학습: 에이전트·환경·상태·행동·보상·정책으로 구성됩니다. 레이블은 지도 학습의 개념입니다."),
    _Q(17,3,"암 진단·금융 사기 탐지처럼 FN(실제 양성을 음성으로 분류) 비용이 높을 때 중요한 지표는?",["정밀도(Precision)","재현율(Recall)","특이도(Specificity)","정확도(Accuracy)"],1,"FN이 치명적인 경우(암 미진단, 사기 미탐지) 재현율(Recall = TP/(TP+FN))을 최대화해야 합니다."),
    _Q(18,3,"AutoML이 자동화하지 못하는 단계는?",["특성 공학(Feature Engineering)","모델 선택(Model Selection)","하이퍼파라미터 튜닝","비즈니스 목표 수립"],3,"AutoML은 특성 공학, 모델 선택, 하이퍼파라미터 최적화, 앙상블 구성을 자동화합니다. 비즈니스 목표는 사람이 수립해야 합니다."),
    _Q(19,3,"소셜 네트워크 관계 분석·추천 시스템에 활용되는 신경망 구조는?",["CNN(합성곱 신경망)","RNN(순환 신경망)","GNN(그래프 신경망)","Autoencoder"],2,"GNN은 노드·엣지로 구성된 그래프 데이터를 처리합니다. 소셜 네트워크, 지식 그래프, 분자 구조 분석에 활용됩니다."),
    _Q(20,3,"미리 정의된 모든 하이퍼파라미터 조합을 전수 탐색하는 최적화 방법은?",["랜덤 서치(Random Search)","베이지안 최적화","그리드 서치(Grid Search)","조기 종료(Early Stopping)"],2,"그리드 서치는 모든 조합을 전수 탐색합니다. 랜덤 서치는 무작위 샘플링, 베이지안 최적화는 이전 결과를 활용한 효율적 탐색입니다."),
    _Q(21,1,"공정하고 책임 있는 AI 개발을 위해 핵심으로 제시되는 가이드라인 원칙이 아닌 것은?",["공정성(Fairness)","투명성(Transparency)","책임성(Accountability)","최대 수익성(Maximum Profitability)"],3,"AI 윤리 원칙: 공정성, 투명성, 책임성, 안전성, 프라이버시 보호. 최대 수익성은 AI 윤리 원칙이 아닙니다."),
    _Q(22,1,"데이터 아키텍처 관점에서 데이터 레이크하우스(Lakehouse)의 특징은?",["완전한 비정형 데이터만 저장","데이터 레이크의 유연성과 DW의 ACID 트랜잭션·구조화 쿼리를 통합","오직 관계형 데이터만 지원","배치 처리만 가능"],1,"레이크하우스는 데이터 레이크의 저비용·유연성과 데이터 웨어하우스의 ACID, 스키마, 성능을 결합한 현대적 아키텍처입니다."),
    _Q(23,1,"GDPR(EU 일반 데이터 보호 규정)의 핵심 원칙이 아닌 것은?",["데이터 최소화(Data Minimization)","목적 제한(Purpose Limitation)","저장 제한(Storage Limitation)","데이터 무제한 수집 원칙"],3,"GDPR 원칙: 적법·공정·투명, 목적 제한, 데이터 최소화, 정확성, 저장 제한, 무결성·기밀성. 무제한 수집은 위반입니다."),
    _Q(24,1,"AI 모델이 학습 데이터에 없는 새 상황에서 성능이 저하되는 현상은?",["편향(Bias)","분산(Variance)","분포 이동(Distribution Shift)","과적합(Overfitting)"],2,"분포 이동(Covariate Shift 등)은 학습 데이터와 배포 환경의 데이터 분포 차이로 모델 성능이 저하되는 현상입니다."),
    _Q(25,1,"대용량 데이터를 압축 저장하고 칼럼 기반으로 빠른 분석 쿼리를 지원하는 AWS 서비스는?",["Amazon RDS","Amazon Redshift","Amazon DynamoDB","Amazon EC2"],1,"Amazon Redshift는 클라우드 기반 데이터 웨어하우스 서비스로 페타바이트 규모 분석을 지원합니다."),
    _Q(26,2,"분석 보고서 시각화 원칙 중 '데이터 잉크 비율(Data-Ink Ratio)'의 의미는?",["사용하는 색상 수를 최대화","차트의 실제 데이터를 나타내는 잉크 비율을 높이고 불필요한 장식 제거","배경색을 화려하게","3D 차트 적극 활용"],1,"터프티(Tufte)의 데이터 잉크 비율: 차트의 잉크 중 실제 데이터를 표현하는 비율을 최대화하여 불필요한 장식(차트 정크)을 제거합니다."),
    _Q(27,2,"분석 과제 수행에서 데이터 수집 시 '데이터 편향(Data Bias)' 방지 방법으로 옳은 것은?",["특정 집단 데이터만 수집","대표성 있는 데이터를 균형 있게 수집","가장 구하기 쉬운 데이터만 사용","샘플 크기를 최소화"],1,"데이터 편향 방지: 목표 모집단 전체를 대표하는 균형 잡힌 샘플 수집, 수집 방법의 편향 검토."),
    _Q(28,2,"분석 결과의 비즈니스 가치 창출을 위한 마지막 단계인 '가치화'에서 핵심 활동은?",["데이터 수집","알고리즘 선택","분석 인사이트를 실제 의사결정·행동으로 연결","모델 성능 평가"],2,"가치화는 분석 인사이트를 실제 비즈니스 프로세스·의사결정에 반영하여 경제적·사회적 가치를 창출하는 단계입니다."),
    _Q(29,2,"분석 조직의 역할 중 현업 부서에 내재되어 비즈니스와 데이터를 연결하는 역할은?",["데이터 엔지니어","데이터 사이언티스트","시민 데이터 분석가(Citizen Data Analyst)","데이터 스튜어드"],2,"시민 데이터 분석가는 현업 부서에서 비즈니스 맥락을 이해하며 셀프서비스 도구로 데이터를 분석하는 역할입니다."),
    _Q(30,2,"분석 플랫폼 선정 기준으로 가장 중요하지 않은 것은?",["데이터 처리 성능 및 확장성","보안 및 데이터 거버넌스 지원","분석 목적·규모 적합성","개발팀 담당자의 개인 취향"],3,"플랫폼 선정: 처리 성능, 확장성, 보안, 통합성, 비용, 사용 편의성, 기술 지원. 개인 취향은 기준이 아닙니다."),
    _Q(31,3,"LIME(Local Interpretable Model-agnostic Explanations)의 목적은?",["모델 전체적 특성 요약","블랙박스 모델의 개별 예측 결과를 국소적으로 해석","모델 재학습 자동화","데이터 정규화 기법"],1,"LIME은 복잡한 블랙박스 모델의 특정 예측 결과를 국소적으로 단순한 해석 가능 모델로 근사하여 설명합니다."),
    _Q(32,3,"Attention Mechanism을 도입한 트랜스포머(Transformer)가 기존 RNN 대비 가진 장점은?",["파라미터 수가 적음","순차적 처리로 학습 안정","병렬 처리 가능, 장거리 의존성 포착 우수","메모리 사용량이 적음"],2,"트랜스포머는 셀프 어텐션으로 병렬 처리가 가능하고 시퀀스 내 장거리 의존성을 효과적으로 포착합니다."),
    _Q(33,3,"SHAP(SHapley Additive exPlanations) 값의 역할은?",["모델 학습률 조정","각 특성이 예측값에 기여한 정도를 수치로 설명","데이터 전처리 자동화","하이퍼파라미터 최적화"],1,"SHAP는 게임 이론의 샤플리 값을 기반으로 각 특성이 모델 예측에 얼마나 기여했는지를 수치로 제공합니다."),
    _Q(34,3,"이진 분류의 임계값(Threshold)을 0.3으로 낮추면 예상되는 변화는?",["정밀도(Precision) 향상, 재현율(Recall) 감소","재현율(Recall) 향상, 정밀도(Precision) 감소","정확도(Accuracy) 항상 향상","AUC 값 향상"],1,"임계값을 낮추면 양성 예측이 늘어 재현율↑ 정밀도↓. 암 검진·사기 탐지처럼 FN이 치명적인 경우에 활용합니다."),
    _Q(35,3,"인과 관계(Causation)와 상관 관계(Correlation)의 차이에 대한 설명으로 옳은 것은?",["상관 관계가 있으면 반드시 인과 관계가 있다","인과 관계가 있으면 반드시 상관 관계가 있다","상관 관계와 인과 관계는 항상 동일하다","둘 중 하나만 성립할 수 없다"],1,"인과 관계가 있으면 상관 관계가 존재하지만, 상관 관계가 있다고 인과 관계를 의미하지는 않습니다. 상관 ≠ 인과."),
    _Q(36,3,"전이 학습(Transfer Learning)의 핵심 개념은?",["소수 데이터로 처음부터 학습","대규모 데이터로 사전 학습된 모델을 새 과제에 파인튜닝(fine-tuning)","비지도 학습으로 레이블 없이 학습","강화 학습으로 보상 최대화"],1,"전이 학습: ImageNet·GPT 등으로 사전 학습된 모델의 지식을 새 태스크에 이전(fine-tuning)하여 소량 데이터로도 높은 성능을 냅니다."),
    _Q(37,3,"Confusion Matrix에서 실제 음성 중 음성으로 올바르게 예측한 비율은?",["민감도(Sensitivity)","특이도(Specificity)","정밀도(Precision)","F1-Score"],1,"특이도(Specificity) = TN/(TN+FP). 실제 음성 중 음성으로 올바르게 분류한 비율. 민감도(Recall)의 반대 개념입니다."),
    _Q(38,3,"가중치 감소(Weight Decay)의 효과와 동일한 정규화 기법은?",["L1 정규화(Lasso)","L2 정규화(Ridge)","드롭아웃","배치 정규화"],1,"가중치 감소(Weight Decay)는 손실 함수에 가중치 제곱합을 더하는 L2 정규화와 동일한 효과를 냅니다."),
    _Q(39,3,"적대적 공격(Adversarial Attack)에 대한 설명으로 옳은 것은?",["데이터 수집을 방해하는 공격","인간이 인지하기 어려운 미세한 노이즈를 입력에 추가해 모델 오분류 유발","모델 학습 속도를 저하시키는 공격","데이터베이스를 파괴하는 공격"],1,"적대적 공격은 인간 눈에 보이지 않는 미세 노이즈를 이미지 등에 추가하여 AI 모델이 오분류하도록 유도합니다."),
    _Q(40,3,"분산 학습(Distributed Training) 방식 중 데이터를 여러 노드에 분산하고 각 노드가 전체 모델을 보유하는 방법은?",["모델 병렬화(Model Parallelism)","데이터 병렬화(Data Parallelism)","파이프라인 병렬화","하이브리드 병렬화"],1,"데이터 병렬화는 전체 모델을 각 노드에 복사하고 데이터를 분할하여 동시에 학습합니다. 모델 병렬화는 모델 자체를 분할합니다."),
  ],
};

const ADSP_EXAMS = [
  { round:13, label:"13회 기출", date:"2018.09", desc:"DIKW · 빅데이터 거버넌스 · 최적회귀 · 군집분석 · 연관분석 중심" },
  { round:44, label:"44회 기출", date:"2023.03", desc:"데이터 이해 기초 · 분석 방법론 · 회귀·군집 분석 중심" },
  { round:45, label:"45회 기출", date:"2023.07", desc:"빅데이터 가치 · 딥러닝 기초 · 나이브 베이즈 · 앙상블 중심" },
  { round:46, label:"46회 기출", date:"2023.11", desc:"빅데이터 플랫폼 · 텍스트 마이닝 · AUC·판별분석 중심" },
  { round:47, label:"47회 기출", date:"2024.03", desc:"데이터 레이크 · MLOps 기초 · XGBoost · 실루엣 계수 중심" },
  { round:48, label:"48회 기출", date:"2024.07", desc:"생성형 AI · 트랜스포머 · 연합학습 · 이상 탐지 중심" },
];

// 기존 호환 (AdspScreen에서 참조)
const ADSP_QUESTIONS = [
  // ── 과목 1: 데이터 이해 (10문항) ───────────────
  { no:1,  sub:1, q:"빅데이터의 3V 특성으로 올바르게 짝지어진 것은?",
    opts:["Volume, Velocity, Variety","Volume, Value, Variety","Value, Velocity, Variety","Volume, Velocity, Veracity"],
    ans:0, ex:"빅데이터의 기본 특성은 3V: 규모(Volume), 속도(Velocity), 다양성(Variety)입니다. 이후 진실성(Veracity), 가치(Value)가 추가되어 5V로 확장됩니다." },
  { no:2,  sub:1, q:"다음 중 반정형(Semi-structured) 데이터에 해당하는 것은?",
    opts:["관계형 DB 테이블","XML · JSON 문서","SNS 게시글 · 이미지","엑셀 스프레드시트"],
    ans:1, ex:"XML, JSON은 구조는 있지만 고정 스키마가 없는 반정형 데이터입니다. 관계형 DB·엑셀은 정형, SNS 텍스트·이미지는 비정형입니다." },
  { no:3,  sub:1, q:"개인정보 비식별화 기법 중 나이 35 → '30대'처럼 값을 범위로 표현하는 방법은?",
    opts:["가명처리","총계처리","데이터 범주화","데이터 삭제"],
    ans:2, ex:"데이터 범주화는 특정 수치를 구간(범주)으로 변환해 개인을 특정하기 어렵게 만드는 비식별화 기법입니다." },
  { no:4,  sub:1, q:"NoSQL 데이터베이스의 특징으로 올바른 것은?",
    opts:["ACID 속성을 완벽히 보장","스키마가 항상 고정됨","수평적 확장(Scale-out)이 용이","JOIN 연산에 최적화"],
    ans:2, ex:"NoSQL은 수평 확장이 용이하고 유연한 스키마를 지원합니다. ACID 완벽 보장은 RDBMS의 특징입니다." },
  { no:5,  sub:1, q:"다음 중 데이터베이스의 4가지 특성(DBMS 정의)에 해당하지 않는 것은?",
    opts:["통합된 데이터(Integrated Data)","저장된 데이터(Stored Data)","운영 데이터(Operational Data)","분리된 데이터(Isolated Data)"],
    ans:3, ex:"DBMS의 데이터 특성: 통합(Integrated)·저장(Stored)·운영(Operational)·공유(Shared). '분리된 데이터'는 해당 없습니다." },
  { no:6,  sub:1, q:"빅데이터 등장 배경으로 가장 거리가 먼 것은?",
    opts:["스마트폰·IoT 기기 확산","소셜미디어 활성화","클라우드 컴퓨팅 발전","종이 문서 사용량 증가"],
    ans:3, ex:"빅데이터는 디지털 기기 확산, 소셜미디어, 클라우드, IoT 등으로 인해 등장했습니다. 종이 문서는 무관합니다." },
  { no:7,  sub:1, q:"데이터 웨어하우스(Data Warehouse)의 특성이 아닌 것은?",
    opts:["주제 중심적(Subject-Oriented)","통합적(Integrated)","비휘발적(Non-Volatile)","실시간 갱신(Real-time Update)"],
    ans:3, ex:"데이터 웨어하우스는 주제 중심·통합·비휘발·시간적 특성을 가집니다. 실시간 갱신은 OLTP(운영DB)의 특성입니다." },
  { no:8,  sub:1, q:"마스터 데이터 관리(MDM)의 주요 목적으로 올바른 것은?",
    opts:["거래 데이터의 고속 처리","핵심 데이터(고객·제품 등)의 일관성 유지","비정형 데이터의 구조화","실시간 스트리밍 처리"],
    ans:1, ex:"MDM은 조직 전체에서 사용하는 핵심 마스터 데이터(고객, 제품, 직원 등)의 정확성과 일관성을 관리합니다." },
  { no:9,  sub:1, q:"데이터 사이언티스트에게 필요한 역량으로 가장 거리가 먼 것은?",
    opts:["수학·통계 지식","프로그래밍 능력","비즈니스 도메인 이해","물리 서버 직접 제작·설치"],
    ans:3, ex:"데이터 사이언티스트는 수학·통계, 프로그래밍(하드스킬), 커뮤니케이션·도메인(소프트스킬)이 필요합니다." },
  { no:10, sub:1, q:"다음 중 정형 데이터가 아닌 것은?",
    opts:["관계형 DB 테이블","엑셀(CSV) 파일","동영상·이미지 파일","ERP 트랜잭션 데이터"],
    ans:2, ex:"동영상·이미지는 구조화되지 않은 비정형 데이터입니다. 관계형 DB, 엑셀, ERP는 정형 데이터입니다." },

  // ── 과목 2: 데이터 분석 기획 (10문항) ──────────
  { no:11, sub:2, q:"CRISP-DM 방법론의 6단계 순서로 올바른 것은?",
    opts:["비즈니스이해→데이터이해→데이터준비→모델링→평가→전개","데이터이해→비즈니스이해→데이터준비→모델링→평가→전개","비즈니스이해→데이터준비→데이터이해→모델링→평가→전개","비즈니스이해→모델링→데이터준비→데이터이해→평가→전개"],
    ans:0, ex:"CRISP-DM 6단계: Business Understanding → Data Understanding → Data Preparation → Modeling → Evaluation → Deployment" },
  { no:12, sub:2, q:"KDD 프로세스의 순서로 올바른 것은?",
    opts:["Selection→Preprocessing→Transformation→Mining→Interpretation","Preprocessing→Selection→Transformation→Mining→Interpretation","Selection→Transformation→Preprocessing→Mining→Interpretation","Mining→Selection→Preprocessing→Transformation→Interpretation"],
    ans:0, ex:"KDD 5단계: 선택(Selection) → 전처리(Preprocessing) → 변환(Transformation) → 데이터 마이닝(Mining) → 해석(Interpretation)" },
  { no:13, sub:2, q:"분석 방법론 SEMMA의 단계가 아닌 것은?",
    opts:["Sample (샘플링)","Explore (탐색)","Modify (수정·변환)","Deploy (배포)"],
    ans:3, ex:"SEMMA = Sample → Explore → Modify → Model → Assess. Deploy(배포)는 CRISP-DM에 해당하며 SEMMA에는 없습니다." },
  { no:14, sub:2, q:"분석 기획의 '하향식(Top-down) 접근법' 설명으로 옳은 것은?",
    opts:["데이터 자체에서 인사이트를 발굴","명확한 비즈니스 목표에서 출발","비정형 데이터 분석에 특화","빠른 프로토타이핑에 최적화"],
    ans:1, ex:"하향식(Top-down)은 목적이 명확한 경우 비즈니스 목표 → 분석 과제 도출 순으로 진행합니다. 상향식(Bottom-up)은 데이터에서 인사이트를 발굴합니다." },
  { no:15, sub:2, q:"분석 성숙도 모델의 단계 중 가장 높은 수준은?",
    opts:["도입(Initiation)","활용(Utilization)","확산(Expansion)","최적화(Optimization)"],
    ans:3, ex:"분석 성숙도: 도입 → 활용 → 확산 → 최적화 단계로 발전합니다. 최적화 단계는 전사적으로 분석이 내재화된 상태입니다." },
  { no:16, sub:2, q:"분석 과제 우선순위 결정 2×2 매트릭스의 두 축으로 올바른 것은?",
    opts:["분석 난이도 & 데이터 규모","전략적 중요도(비즈니스 가치) & 실행 용이성","예산 규모 & 분석가 수","데이터 품질 & 분석 기간"],
    ans:1, ex:"과제 우선순위 매트릭스는 '비즈니스 가치(전략적 중요도)'와 '실행 용이성(비용·기간·난이도)'을 두 축으로 평가합니다." },
  { no:17, sub:2, q:"분석 거버넌스 체계의 구성 요소가 아닌 것은?",
    opts:["데이터 분석 표준 및 절차","조직 및 인력 체계","데이터 관리 체계","분석가 해외 파견 프로그램"],
    ans:3, ex:"분석 거버넌스: 분석 기획·관리 조직, 과제 관리 프로세스, 데이터 관리 체계, 분석 교육 및 변화관리로 구성됩니다." },
  { no:18, sub:2, q:"전사 분석 업무를 담당하는 별도 전담 조직을 두는 분석 조직 구조는?",
    opts:["기능 중심형","분산형","집중형","CoE(Center of Excellence)"],
    ans:2, ex:"집중형 구조는 독립된 분석 전담팀이 전사 분석을 수행합니다. 분산형은 현업 부서에 분석가를 배치합니다." },
  { no:19, sub:2, q:"분석 마스터 플랜에 포함되는 내용이 아닌 것은?",
    opts:["단계별 분석 로드맵","소요 예산 및 일정","분석 과제 목록","분석가 개인 연봉 결정 기준"],
    ans:3, ex:"마스터 플랜: 분석 과제·우선순위, 로드맵, 예산·일정, 조직·거버넌스 방안. 개인 연봉 결정은 해당되지 않습니다." },
  { no:20, sub:2, q:"데이터 분석 ROI 산정 시 고려하지 않아도 되는 것은?",
    opts:["분석 시스템 구축 비용","예상 비용 절감 효과","예상 매출 증대 효과","분석 담당자의 출신 대학"],
    ans:3, ex:"ROI = (기대 효과 - 투자 비용) / 투자 비용. 투자 비용과 기대 효과를 정량적으로 산정해야 하며 담당자 출신 대학은 무관합니다." },

  // ── 과목 3: 데이터 분석 (20문항) ───────────────
  { no:21, sub:3, q:"정규분포의 특성이 아닌 것은?",
    opts:["좌우 대칭 형태","평균 = 중앙값 = 최빈값","왜도(Skewness) = 0","표본 크기에 따라 형태가 크게 변한다"],
    ans:3, ex:"정규분포는 좌우 대칭, 왜도=0, 평균=중앙값=최빈값 특성을 가집니다. 형태는 평균(μ)과 표준편차(σ)에 의해서만 결정됩니다." },
  { no:22, sub:3, q:"두 범주형 변수 간의 독립성 검정에 사용하는 통계 기법은?",
    opts:["독립표본 t-검정","일원분산분석(One-way ANOVA)","카이제곱(χ²) 검정","피어슨 상관분석"],
    ans:2, ex:"카이제곱 검정은 범주형 변수들이 서로 독립인지 검정합니다. t-검정·ANOVA는 연속형 평균 비교, 피어슨은 선형 상관 측정입니다." },
  { no:23, sub:3, q:"다중 회귀분석에서 독립변수 간 강한 상관관계로 발생하는 문제는?",
    opts:["이분산성(Heteroscedasticity)","다중공선성(Multicollinearity)","자기상관(Autocorrelation)","잔차 정규성 위반"],
    ans:1, ex:"다중공선성은 독립변수들 간의 강한 상관으로 회귀계수 추정이 불안정해지는 문제입니다. VIF로 진단합니다." },
  { no:24, sub:3, q:"CART 의사결정나무의 분류 분리 기준으로 사용되는 불순도 측도는?",
    opts:["정보이득(Information Gain)","카이제곱(χ²) 통계량","지니 지수(Gini Index)","엔트로피(Entropy)"],
    ans:2, ex:"CART(Classification And Regression Tree)는 분류 시 지니 지수(Gini Index)를 사용하여 이진(binary) 분리합니다." },
  { no:25, sub:3, q:"K-평균(K-means) 군집분석의 특징으로 옳은 것은?",
    opts:["군집 수를 자동으로 결정","이상치(Outlier)에 강건하다","계층적 군집화 방법이다","초기 중심값에 따라 결과가 달라질 수 있다"],
    ans:3, ex:"K-means는 초기 중심값(centroid) 설정에 결과가 민감합니다. 군집 수 k는 사전 지정이 필요하고 이상치에 취약합니다." },
  { no:26, sub:3, q:"로지스틱 회귀분석의 종속변수로 적합한 것은?",
    opts:["연속형 수치 변수","이진형 범주 변수 (0 또는 1)","순서형 변수만","정규분포를 따르는 변수"],
    ans:1, ex:"로지스틱 회귀는 종속변수가 이진형(0/1)일 때 사용하며, 결과를 0~1 사이의 확률로 출력합니다(시그모이드 함수)." },
  { no:27, sub:3, q:"연관규칙에서 신뢰도(Confidence)의 의미로 올바른 것은?",
    opts:["전체 거래 중 A와 B가 함께 등장하는 비율","A를 구매한 거래 중 B도 구매한 비율","A와 B 연관이 우연인지 나타내는 척도","모든 거래에서 B가 등장하는 빈도"],
    ans:1, ex:"신뢰도 = P(B|A) = P(A∩B)/P(A). A가 발생했을 때 B가 함께 발생하는 조건부 확률입니다. 지지도는 P(A∩B)입니다." },
  { no:28, sub:3, q:"부스팅(Boosting) 앙상블의 특징으로 올바른 것은?",
    opts:["여러 모델을 병렬로 독립 학습","이전 모델의 오분류 샘플에 가중치를 높여 순차 학습","무작위 샘플링으로 독립 모델 구성","단순 다수결 투표로 결합"],
    ans:1, ex:"부스팅은 이전 모델이 잘못 예측한 샘플에 가중치를 높여 순차적으로 약한 학습기(weak learner)를 강화합니다. 대표 알고리즘: AdaBoost, XGBoost." },
  { no:29, sub:3, q:"혼동행렬(Confusion Matrix)에서 실제 양성(Positive)인데 음성(Negative)으로 예측한 경우는?",
    opts:["True Positive (TP)","False Positive (FP)","True Negative (TN)","False Negative (FN)"],
    ans:3, ex:"FN(False Negative, 2종 오류): 실제는 양성이지만 모델이 음성으로 잘못 예측. 의료 진단에서 질병을 놓치는 경우에 해당합니다." },
  { no:30, sub:3, q:"ARIMA(p,d,q) 모형에서 'q'가 나타내는 것은?",
    opts:["자기회귀(AR) 차수","차분(Differencing) 횟수","이동평균(MA) 차수","계절성 주기"],
    ans:2, ex:"ARIMA(p,d,q): p=AR(자기회귀) 차수, d=차분 횟수(정상화), q=MA(이동평균) 차수입니다." },
  { no:31, sub:3, q:"주성분분석(PCA)의 주요 목적으로 올바른 것은?",
    opts:["군집 수 자동 결정","고차원 데이터의 차원 축소(정보 손실 최소화)","독립변수 간 상관관계 증가","종속변수 직접 예측"],
    ans:1, ex:"PCA는 분산을 최대로 설명하는 주성분 방향으로 데이터를 투영하여 차원을 축소합니다. 다중공선성 완화에도 활용합니다." },
  { no:32, sub:3, q:"SVM(Support Vector Machine)이 최적화하는 핵심 목표는?",
    opts:["오분류 샘플 수 최소화","결정 경계와 서포트 벡터 사이의 마진(Margin) 최대화","모든 훈련 데이터를 100% 분류","군집 내 분산 최소화"],
    ans:1, ex:"SVM은 두 클래스를 구분하는 결정 경계(hyperplane)를 마진(Margin)이 최대가 되도록 찾습니다." },
  { no:33, sub:3, q:"불균형 데이터(Imbalanced Data)에서 모델 평가로 가장 적합한 지표는?",
    opts:["정확도(Accuracy)","AUC-ROC 또는 F1-Score","평균제곱오차(MSE)","R²(결정계수)"],
    ans:1, ex:"불균형 데이터에서는 정확도가 높아도 모델이 다수 클래스만 예측할 수 있어 AUC-ROC, F1-Score, G-mean이 더 적합합니다." },
  { no:34, sub:3, q:"수치형 변수를 0~1 사이 값으로 변환하는 전처리 기법은?",
    opts:["Z-score 표준화(Standardization)","Min-Max 정규화(Normalization)","원-핫 인코딩(One-hot Encoding)","레이블 인코딩(Label Encoding)"],
    ans:1, ex:"Min-Max 정규화: x' = (x - x_min)/(x_max - x_min). Z-score는 평균 0·분산 1로 변환합니다." },
  { no:35, sub:3, q:"인공신경망에서 ReLU 활성화 함수를 사용하는 주된 이유는?",
    opts:["출력이 0~1 확률로 표현되므로","기울기 소실(Vanishing Gradient) 문제 완화","음수 값 처리가 불가능하므로","계산 비용이 높아 정확하므로"],
    ans:1, ex:"ReLU = max(0, x)는 양수 구간에서 기울기가 1로 유지되어 시그모이드·tanh의 기울기 소실 문제를 완화합니다." },
  { no:36, sub:3, q:"랜덤 포레스트(Random Forest)에서 사용하는 앙상블 핵심 기법은?",
    opts:["부스팅(Boosting)","배깅(Bagging) + 랜덤 특성 선택","스태킹(Stacking)","단순 평균 앙상블"],
    ans:1, ex:"랜덤 포레스트는 배깅(Bootstrap Aggregating)으로 데이터를 샘플링하고, 각 분기에서 랜덤하게 특성을 선택해 다양성을 확보합니다." },
  { no:37, sub:3, q:"결측값(Missing Value) 처리 방법으로 가장 부적절한 것은?",
    opts:["수치형 변수 → 평균·중앙값으로 대체","범주형 변수 → 최빈값으로 대체","회귀 예측 모델로 결측값 추정","결측 여부와 무관하게 임의 최댓값 대입"],
    ans:3, ex:"임의로 최댓값을 대입하면 데이터 분포가 왜곡됩니다. 단순 삭제·통계값 대체·예측 모델 대체 등이 올바른 방법입니다." },
  { no:38, sub:3, q:"k-겹 교차검증(k-fold Cross Validation)에 대한 설명으로 옳은 것은?",
    opts:["데이터를 k등분해 k번 학습·검증을 반복 후 평균","데이터를 단 한 번만 학습·검증으로 분리","훈련 데이터만 사용하여 과적합 감소","검증 세트 크기가 항상 데이터 1건"],
    ans:0, ex:"k-fold CV: 데이터를 k등분 → k번 반복(매번 다른 1개 fold를 검증, 나머지 k-1을 훈련) → 결과 평균으로 모델 성능 평가." },
  { no:39, sub:3, q:"다음 중 비지도 학습(Unsupervised Learning)에 해당하는 것은?",
    opts:["선형 회귀(Linear Regression)","로지스틱 회귀(Logistic Regression)","의사결정나무(Decision Tree)","K-means 군집분석"],
    ans:3, ex:"K-means는 레이블 없이 데이터의 유사성을 기반으로 군집을 발견하는 비지도 학습입니다. 나머지는 모두 지도 학습입니다." },
  { no:40, sub:3, q:"시계열 분석에서 정상성(Stationarity) 조건이 아닌 것은?",
    opts:["시간에 따라 평균이 일정","시간에 따라 분산이 일정","자기공분산이 시점에 무관","뚜렷한 상승·하락 추세(Trend) 존재"],
    ans:3, ex:"정상 시계열: 평균·분산·자기공분산이 시간에 무관해야 합니다. 추세나 계절성이 있으면 비정상이며 차분·변환으로 정상화합니다." },
];

function AdspExamListScreen({ onSelect, onBack }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ padding: isMobile?"16px 14px 60px":"32px 32px 60px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.muted, fontFamily:SANS, fontSize:13, cursor:"pointer", marginBottom:16, padding:0 }}>
        ← 자격증 목록
      </button>
      <div style={{ fontFamily:SANS, fontSize:isMobile?17:20, fontWeight:800, color:C.text, marginBottom:4 }}>ADsP 데이터 분석 준전문가</div>
      <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom:28 }}>응시할 회차를 선택하세요 · 회차별 40문항</div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {ADSP_EXAMS.map(exam => (
          <button key={exam.round} onClick={() => onSelect(exam.round)} style={{
            display:"flex", alignItems:"center", gap:16, padding:isMobile?"14px 16px":"18px 20px",
            borderRadius:12, border:`1px solid ${C.blue+"44"}`,
            background:C.blue+"0D", cursor:"pointer", textAlign:"left",
          }}>
            <div style={{ width:36, height:36, borderRadius:9, background:C.blue+"33", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:MONO, fontSize:12, fontWeight:700, color:C.blue, flexShrink:0 }}>
              {exam.round}회
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:SANS, fontSize:isMobile?13:14, fontWeight:700, color:C.text }}>{exam.label} <span style={{ fontFamily:MONO, fontSize:10, color:C.muted, marginLeft:6 }}>{exam.date}</span></div>
              <div style={{ fontFamily:SANS, fontSize:isMobile?11:12, color:C.muted, marginTop:2 }}>{exam.desc}</div>
            </div>
            <span style={{ fontFamily:MONO, fontSize:10, color:C.blue }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AdspScreen({ round, onBack }) {
  const [subFilter, setSubFilter] = useState(0);
  const [answers, setAnswers] = useState({});
  const isMobile = useIsMobile();

  const questions = ADSP_ROUNDS[round] || [];
  const examInfo = ADSP_EXAMS.find(e => e.round === round) || { label:`${round}회 기출`, date:"" };

  const SUB_NAMES = [`전체 (${questions.length}문항)`, "과목1 · 데이터 이해", "과목2 · 분석 기획", "과목3 · 데이터 분석"];
  const SUB_COLORS = [C.blue, C.purple, C.yellow, C.green];

  const filtered = subFilter === 0 ? questions : questions.filter(q => q.sub === subFilter);
  const subScore = (s) => {
    const qs = questions.filter(q => q.sub === s);
    const c = qs.filter(q => answers[q.no]?.confirmed && answers[q.no]?.sel === q.ans).length;
    const d = qs.filter(q => answers[q.no]?.confirmed).length;
    return { correct: c, done: d, total: qs.length };
  };
  const allDone = Object.values(answers).filter(a => a?.confirmed).length;
  const allCorrect = questions.filter(q => answers[q.no]?.confirmed && answers[q.no]?.sel === q.ans).length;
  const pass1 = subScore(1).correct >= subScore(1).total * 0.4;
  const pass2 = subScore(2).correct >= subScore(2).total * 0.4;
  const pass3 = subScore(3).correct >= subScore(3).total * 0.4;
  const totalPass = questions.length > 0 && allCorrect >= questions.length * 0.6 && pass1 && pass2 && pass3;

  const select = (no, idx) => {
    setAnswers(a => ({...a, [no]: { sel: idx, confirmed: true }}));
  };

  return (
    <div style={{ padding: isMobile?"16px 14px 60px":"32px 32px 60px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.muted, fontFamily:SANS, fontSize:13, cursor:"pointer", marginBottom:16, padding:0 }}>← 회차 선택</button>
      <div style={{ fontFamily:SANS, fontSize:isMobile?16:20, fontWeight:800, color:C.text, marginBottom:2 }}>ADsP {examInfo.label}</div>
      <div style={{ fontFamily:SANS, fontSize:12, color:C.muted, marginBottom:20 }}>{questions.length}문항 · {examInfo.date} · 과목별 40% 이상 & 총점 60점 이상 합격</div>

      {/* 점수판 */}
      {allDone > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)", gap:8, marginBottom:20 }}>
          {[
            { label:"전체", correct:allCorrect, done:allDone, total:questions.length, pass:totalPass, color:C.blue },
            { label:"과목1", ...subScore(1), pass:pass1, color:C.purple },
            { label:"과목2", ...subScore(2), pass:pass2, color:C.yellow },
            { label:"과목3", ...subScore(3), pass:pass3, color:C.green },
          ].map(s => (
            <div key={s.label} style={{ background:C.card2, borderRadius:10, padding:"12px 14px", border:`1px solid ${s.done>0?(s.pass?s.color+"66":C.coral+"66"):C.line}` }}>
              <div style={{ fontFamily:SANS, fontSize:11, color:C.muted, marginBottom:4 }}>{s.label}</div>
              <div style={{ fontFamily:SANS, fontSize:18, fontWeight:800, color:s.done>0?(s.pass?s.color:C.coral):C.muted }}>{s.done>0?`${s.correct}/${s.done}`:"—"}</div>
              {s.done>0 && <div style={{ fontFamily:MONO, fontSize:9, color:s.pass?s.color:C.coral, marginTop:2 }}>{s.pass?"✓ 과락 없음":"✗ 과락"}</div>}
            </div>
          ))}
        </div>
      )}
      {allDone >= questions.length && questions.length > 0 && (
        <div style={{ marginBottom:20, padding:"14px 18px", borderRadius:10, border:`1px solid ${totalPass?C.green:C.coral}`, background:totalPass?C.green+"11":C.coral+"11", fontFamily:SANS, fontSize:14, fontWeight:700, color:totalPass?C.green:C.coral }}>
          {totalPass?"🎉 합격! 총점 60점 이상 & 과목별 과락 없음":"❌ 불합격 — 총점 60점 이상 또는 과목별 40% 미달"}
        </div>
      )}

      {/* 과목 필터 탭 */}
      <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
        {[0,1,2,3].map(s => (
          <button key={s} onClick={() => setSubFilter(s)} style={{
            padding:isMobile?"6px 10px":"7px 14px", borderRadius:20, border:`1px solid ${subFilter===s?SUB_COLORS[s]:C.line}`,
            background: subFilter===s?SUB_COLORS[s]+"22":"transparent",
            color: subFilter===s?SUB_COLORS[s]:C.muted, fontFamily:SANS, fontSize:isMobile?10:11, fontWeight:subFilter===s?700:400, cursor:"pointer",
          }}>{isMobile && s>0 ? `과목${s}`:SUB_NAMES[s]}</button>
        ))}
      </div>

      {/* 문제 목록 */}
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {filtered.map(q => {
          const a = answers[q.no];
          const confirmed = a?.confirmed;
          const correct = confirmed && a.sel === q.ans;
          const subColor = SUB_COLORS[q.sub];
          return (
            <div key={q.no} style={{ background:C.card, border:`1px solid ${confirmed?(correct?C.green+"55":C.coral+"55"):C.line}`, borderRadius:12, padding:isMobile?14:18 }}>
              <div style={{ display:"flex", gap:8, marginBottom:10, alignItems:"flex-start" }}>
                <span style={{ flexShrink:0, width:24, height:24, borderRadius:6, background:subColor+"33", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:MONO, fontSize:10, fontWeight:700, color:subColor }}>{q.no}</span>
                <div style={{ flex:1 }}>
                  <span style={{ fontFamily:MONO, fontSize:9, color:subColor, marginRight:6, background:subColor+"22", padding:"2px 6px", borderRadius:4 }}>과목{q.sub}</span>
                  <div style={{ fontFamily:SANS, fontSize:isMobile?12.5:13.5, color:C.text, lineHeight:1.65, marginTop:5 }}>{q.q}</div>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {q.opts.map((opt, i) => {
                  const isSelected = a?.sel === i;
                  const isCorrect = i === q.ans;
                  let bg = C.card2, border = C.line, color = C.muted;
                  if (confirmed) {
                    if (isCorrect) { bg=C.green+"22"; border=C.green; color=C.green; }
                    else if (isSelected && !isCorrect) { bg=C.coral+"22"; border=C.coral; color=C.coral; }
                  } else if (isSelected) { bg=C.blue+"22"; border=C.blue; color=C.blue; }
                  return (
                    <button key={i} onClick={() => !confirmed && select(q.no, i)} style={{
                      display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8,
                      border:`1px solid ${border}`, background:bg, cursor:confirmed?"default":"pointer",
                      textAlign:"left", width:"100%",
                    }}>
                      <span style={{ width:20, height:20, borderRadius:"50%", flexShrink:0, border:`1px solid ${border}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:MONO, fontSize:9, fontWeight:700, color }}>
                        {confirmed && isCorrect ? "✓" : confirmed && isSelected && !isCorrect ? "✗" : `${i+1}`}
                      </span>
                      <span style={{ fontFamily:SANS, fontSize:isMobile?11.5:12.5, color, lineHeight:1.5 }}>{opt}</span>
                    </button>
                  );
                })}
              </div>
              {confirmed && (
                <div style={{ marginTop:10, padding:"9px 12px", background:"#0D1117", borderRadius:8, fontFamily:SANS, fontSize:11.5, color:C.muted, lineHeight:1.65, borderLeft:`3px solid ${correct?C.green:C.coral}` }}>
                  <span style={{ color:correct?C.green:C.coral, fontWeight:700, marginRight:6 }}>{correct?"✓ 정답":"✗ 오답"}</span>
                  {q.ex}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 자격증 모의고사 ───────────────────────────────
function CertScreen() {
  const [activeCert, setActiveCert] = useState(null);
  const [activeRound, setActiveRound] = useState(null);
  const [adspRound, setAdspRound] = useState(null);

  if (!activeCert) return <CertListScreen onSelect={c => { setActiveCert(c); setActiveRound(null); setAdspRound(null); }} />;

  if (activeCert === "adsp") {
    if (!adspRound) return <AdspExamListScreen onSelect={setAdspRound} onBack={() => setActiveCert(null)} />;
    return <AdspScreen round={adspRound} onBack={() => setAdspRound(null)} />;
  }

  if (!activeRound) return <AiceExamListScreen onSelect={setActiveRound} onBack={() => setActiveCert(null)} />;
  return <AiceScreen round={activeRound} onBack={() => setActiveRound(null)} />;
}

function AiceScreen({ round, onBack }) {
  const [selectedQ, setSelectedQ] = useState(null);
  const [draft, setDraft] = useState("");
  const [results, setResults] = useState({});
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState("");
  const isMobile = useIsMobile();

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

  const AICE_QUESTIONS = {
    1: ["call_log.json과 agent_stat.csv를 AgentID 기준 inner merge하여 df에 저장하세요.","Duration 컬럼은 평균값으로, Channel 컬럼은 최빈값으로 결측치를 대체하세요.","Duration 컬럼에서 IQR 기준 이상치 행을 탐지하고 제거하세요.","Channel 컬럼을 원-핫 인코딩하여 df에 반영하세요.","Seaborn을 사용해 Channel별 건수 분포를 countplot으로 시각화하세요.","Duration과 SatisfactionScore의 관계를 jointplot으로 시각화하세요.","수치형 변수 간 상관관계를 계산하고 heatmap으로 시각화하세요.","CallDate에서 Weekday(요일)와 Hour(시간대) 컬럼을 파생변수로 추출하세요.","SatisfactionScore를 target으로 하여 8:2 비율로 Train/Test를 분할하세요.","RandomForestRegressor로 SatisfactionScore 예측 모델을 학습하세요.","학습한 모델의 예측값을 구하고 MAE로 성능을 평가하세요.","Hidden layer 2개 이상, Dropout 0.2, 손실함수 MSE로 딥러닝 모델을 설계하세요.","epochs 30, batch_size 16으로 모델을 학습하고 loss/val_loss 그래프를 비교하세요.","분석 결과를 바탕으로 SatisfactionScore에 가장 큰 영향을 미친 변수를 1~2문장으로 서술하세요."],
    2: ["orders.csv와 customers.csv를 CustomerID 기준 inner merge하여 df에 저장하세요.","Revenue 컬럼은 중앙값으로, Category 컬럼은 최빈값으로 결측치를 대체하세요.","Revenue 컬럼에서 IQR 기준 이상치 행을 탐지하고 제거하세요.","Category 컬럼을 원-핫 인코딩하여 df에 반영하세요.","Seaborn을 사용해 Category별 주문 건수를 countplot으로 시각화하세요.","Revenue와 Quantity의 관계를 jointplot으로 시각화하세요.","수치형 변수 간 상관관계를 계산하고 heatmap으로 시각화하세요.","OrderDate에서 Month(월)와 DayOfWeek(요일) 컬럼을 파생변수로 추출하세요.","Revenue를 target으로 하여 8:2 비율로 Train/Test를 분할하세요.","GradientBoostingRegressor로 Revenue 예측 모델을 학습하세요.","학습한 모델의 예측값을 구하고 R² Score로 성능을 평가하세요.","Hidden layer 2개 이상, Dropout 0.3, 손실함수 MSE로 딥러닝 모델을 설계하세요.","epochs 50, batch_size 32로 모델을 학습하고 EarlyStopping을 적용하세요.","분석 결과를 바탕으로 Revenue에 가장 큰 영향을 미친 변수를 1~2문장으로 서술하세요."],
    3: ["patients.csv와 records.csv를 PatientID 기준 inner merge하여 df에 저장하세요.","Age 컬럼은 중앙값으로, Diagnosis 컬럼은 최빈값으로 결측치를 대체하세요.","BloodPressure 컬럼에서 IQR 기준 이상치 행을 탐지하고 제거하세요.","Gender 컬럼을 원-핫 인코딩하여 df에 반영하세요.","Seaborn을 사용해 Diagnosis별 환자 수를 countplot으로 시각화하세요.","Age와 BloodPressure의 관계를 jointplot으로 시각화하세요.","수치형 변수 간 상관관계를 계산하고 heatmap으로 시각화하세요.","AdmissionDate에서 Month(월)와 Season(계절) 컬럼을 파생변수로 추출하세요.","Readmission을 target으로 하여 8:2 비율로 Train/Test를 분할하세요.","RandomForestClassifier로 재입원 예측 모델을 학습하세요.","학습한 모델의 예측값을 구하고 AUC Score로 성능을 평가하세요.","Hidden layer 2개 이상, Dropout 0.3, 손실함수 binary_crossentropy로 딥러닝 모델을 설계하세요.","epochs 40, batch_size 32로 모델을 학습하고 confusion_matrix를 시각화하세요.","분석 결과를 바탕으로 재입원에 가장 큰 영향을 미친 변수를 1~2문장으로 서술하세요."],
  };
  const qTexts = AICE_QUESTIONS[round] || AICE_QUESTIONS[1];

  return (
    <div style={{ padding: isMobile ? "16px 14px 60px" : "32px 32px 60px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.muted, fontFamily:SANS, fontSize:13, cursor:"pointer", marginBottom:16, padding:0, display:"flex", alignItems:"center", gap:4 }}>
        ← 회차 목록
      </button>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:isMobile?"flex-start":"flex-end", flexDirection:isMobile?"column":"row", gap:isMobile?8:0, marginBottom:18 }}>
        <div>
          <div style={{ fontFamily:SANS, fontSize:isMobile?16:20, fontWeight:800, color:C.text, marginBottom:2 }}>AICE Associate 모의고사</div>
          <div style={{ fontFamily:SANS, fontSize:12, color:C.muted }}>14문항 · 실제 시험과 동일한 구성</div>
        </div>
        {done > 0 && (
          <div style={{ textAlign:isMobile?"left":"right" }}>
            <div style={{ fontFamily:SANS, fontSize:22, fontWeight:800, color: correct/done >= 0.8 ? C.green : C.coral }}>{Math.round((correct/done)*100)}점</div>
            <div style={{ fontFamily:MONO, fontSize:10, color:C.muted }}>{correct}/{done} 정답 · 80점 합격</div>
          </div>
        )}
      </div>

      {/* 공통 콘텐츠 패널 */}
      {(() => {
        const contentPanel = (
          <div style={{ background:C.card, border:`1px solid ${C.line}`, borderRadius:12, padding:isMobile?14:20 }}>
            {!selectedQ ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:200, gap:8 }}>
                <BookOpen size={28} color={C.muted} />
                <div style={{ fontFamily:SANS, fontSize:13, color:C.muted }}>{isMobile?"위에서 문항을 선택하세요":"왼쪽에서 문항을 선택하세요"}</div>
              </div>
            ) : (
              <>
                <div style={{ fontFamily:MONO, fontSize:10, color:C.blue, fontWeight:700, marginBottom:6 }}>Q{selectedQ.no}. {selectedQ.type}</div>
                <div style={{ fontFamily:SANS, fontSize:isMobile?12.5:13.5, color:C.text, lineHeight:1.6, marginBottom:14 }}>
                  {qTexts[selectedQ.no - 1]}
                </div>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder={selectedQ.no === 14 ? "분석 결과를 작성하세요…" : "여기에 코드를 작성하세요…"}
                  style={{
                    width:"100%", minHeight:isMobile?80:100, borderRadius:8, border:`1px solid ${C.line}`,
                    background:"#0D1117", fontFamily:MONO, fontSize:isMobile?11:12, color:C.text,
                    padding:12, resize:"vertical", outline:"none", boxSizing:"border-box", lineHeight:1.7,
                  }}
                />
                <button onClick={grade} disabled={!draft.trim() || grading} style={{
                  marginTop:10, padding:"9px 18px", borderRadius:8, border:"none",
                  background: draft.trim() && !grading ? C.blue : C.line, color:"#fff",
                  fontFamily:SANS, fontSize:12.5, fontWeight:700, cursor: draft.trim() && !grading ? "pointer" : "not-allowed",
                  width: isMobile ? "100%" : "auto",
                }}>{grading ? "채점 중…" : "제출하고 채점하기"}</button>
                {gradeError && <div style={{ marginTop:10, fontFamily:SANS, fontSize:12, color:C.coral }}>⚠ {gradeError}</div>}
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
                    <div style={{ background:"#0D1117", borderRadius:8, padding:14, fontFamily:MONO, fontSize:isMobile?10.5:11.5, color:"#A8D8B0", lineHeight:1.7, whiteSpace:"pre-wrap", overflowX:"auto" }}>
                      {selectedQ.code}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );

        if (isMobile) return (
          <div>
            {/* 모바일: 문항 번호 가로 스크롤 */}
            <div style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:8, marginBottom:12 }}>
              {(AICE_ALL[round] || AICE_TEMPLATES).map((q) => {
                const r = results[q.no];
                return (
                  <button key={q.no} onClick={() => { setSelectedQ(q); setDraft(results[q.no]?.code || ""); }} style={{
                    flexShrink:0, width:34, height:34, borderRadius:8,
                    border:`1px solid ${selectedQ?.no===q.no?C.blue:C.line}`,
                    background: selectedQ?.no===q.no?C.blue+"22" : !r?C.card : r.correct?C.green+"22":C.coral+"22",
                    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:MONO, fontSize:10, fontWeight:700,
                    color: selectedQ?.no===q.no?C.blue : !r?C.muted : r.correct?C.green:C.coral,
                  }}>{!r ? q.no : r.correct ? <Check size={10}/> : <X size={10}/>}</button>
                );
              })}
            </div>
            {contentPanel}
          </div>
        );

        return (
          <div style={{ display:"grid", gridTemplateColumns:"210px 1fr", gap:14 }}>
            {/* 데스크톱: 문항 목록 사이드바 */}
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              {(AICE_ALL[round] || AICE_TEMPLATES).map((q) => {
                const r = results[q.no];
                return (
                  <button key={q.no} onClick={() => { setSelectedQ(q); setDraft(results[q.no]?.code || ""); }} style={{
                    display:"flex", alignItems:"center", gap:8, padding:"9px 11px", borderRadius:8,
                    border:`1px solid ${selectedQ?.no===q.no?C.blue:C.line}`,
                    background: selectedQ?.no===q.no?C.blue+"11":C.card, cursor:"pointer", textAlign:"left",
                  }}>
                    <span style={{
                      width:20, height:20, borderRadius:5, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:MONO, fontSize:10, fontWeight:700,
                      background: !r?C.card2 : r.correct?C.green+"33":C.coral+"33",
                      color: !r?C.muted : r.correct?C.green:C.coral,
                    }}>{!r ? q.no : r.correct ? <Check size={11}/> : <X size={11}/>}</span>
                    <span style={{ fontFamily:SANS, fontSize:11.5, color:C.text, fontWeight:500 }}>{q.type}</span>
                  </button>
                );
              })}
            </div>
            {contentPanel}
          </div>
        );
      })()}
    </div>
  );
}

// ── 아키텍처 시각화 ───────────────────────────────
// ── 아키텍처 다이어그램 데이터 ────────────────────
const DIAGRAMS = {
  jwt: {
    title:"JWT 인증 흐름", subtitle:"단계별로 토큰이 어디로 이동하는지 확인하세요",
    viewBox:"0 0 710 320",
    nodes:{
      browser: {label:"브라우저",     icon:"🌐", x:30,  y:90,  w:110, h:58},
      storage: {label:"localStorage", icon:"💾", x:30,  y:230, w:110, h:58},
      server:  {label:"FastAPI",      icon:"⚡", x:300, y:90,  w:110, h:58},
      db:      {label:"Supabase DB",  icon:"🗄️", x:570, y:90,  w:110, h:58},
    },
    lines:[
      {x1:140,y1:119,x2:300,y2:119},
      {x1:410,y1:119,x2:570,y2:119},
      {x1:85, y1:148,x2:85, y2:230},
    ],
    steps:[
      {from:"browser",to:"server",  label:"① 로그인 요청",            color:C.blue,   detail:'POST /api/auth/login\n{ "email": "user@example.com", "password": "••••" }'},
      {from:"server", to:"db",      label:"② 사용자 조회",            color:C.green,  detail:"SELECT * FROM users WHERE email = 'user@example.com'"},
      {from:"db",     to:"server",  label:"③ 사용자 반환",            color:C.green,  detail:"User { id: 1, email: '...', password_hash: '$2b$12$...' }"},
      {from:"server", to:"browser", label:"④ JWT 토큰 발급",          color:C.purple, detail:'{ "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }'},
      {from:"browser",to:"storage", label:"⑤ 토큰 저장",              color:C.yellow, detail:"localStorage.setItem('token', 'eyJ...')\n→ 페이지 새로고침해도 유지됨"},
      {from:"browser",to:"server",  label:"⑥ 인증 포함 API 요청",    color:C.blue,   detail:"GET /api/dashboard/stats\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."},
      {from:"server", to:"db",      label:"⑦ 사용자 데이터 조회",    color:C.green,  detail:"토큰 서명 검증 → sub(user_id=1) 추출\nSELECT * FROM aice_submissions WHERE user_id = 1"},
      {from:"db",     to:"server",  label:"⑧ 결과 반환",              color:C.green,  detail:'[{ question_no: 1, is_correct: true }, { question_no: 2, is_correct: false }, ...]'},
      {from:"server", to:"browser", label:"⑨ 응답 — 홈 화면 업데이트",color:C.blue,  detail:'{ "streak": 3, "weekly_minutes": 45, "completed_problems": 8 }'},
    ],
  },
  infra: {
    title:"배포 인프라 구조", subtitle:"브라우저부터 DB까지 + UptimeRobot 슬립 방지",
    viewBox:"0 0 680 270",
    nodes:{
      browser:      {label:"브라우저",    icon:"🌐", x:20,  y:170, w:100, h:58},
      vercel:       {label:"Vercel",      icon:"▲",  x:175, y:170, w:110, h:58, sub:"프론트엔드 CDN"},
      render:       {label:"Render",      icon:"⚡", x:340, y:170, w:110, h:58, sub:"FastAPI 백엔드"},
      supabase:     {label:"Supabase",    icon:"🗄️", x:510, y:170, w:110, h:58, sub:"PostgreSQL DB"},
      uptimerobot:  {label:"UptimeRobot", icon:"🤖", x:340, y:50,  w:110, h:58, sub:"5분마다 핑"},
    },
    lines:[
      {x1:120,y1:199,x2:175,y2:199},
      {x1:285,y1:199,x2:340,y2:199},
      {x1:450,y1:199,x2:510,y2:199},
      {x1:395,y1:108,x2:395,y2:170},
    ],
    steps:[
      {from:"browser",    to:"vercel",   label:"① HTML/JS 요청",          color:C.blue,   detail:"사용자가 ddokddok-phi.vercel.app 접속\nVercel CDN이 React 앱(index.html + JS 번들) 즉시 제공"},
      {from:"vercel",     to:"browser",  label:"② React 앱 전달",          color:C.green,  detail:"브라우저가 React 앱 다운로드 후 실행\nApp.jsx 마운트 → 로그인 화면 렌더링"},
      {from:"browser",    to:"render",   label:"③ API 요청",               color:C.blue,   detail:"POST https://ddokddok.onrender.com/api/auth/login\nCORS 헤더 확인 → FastAPI 처리"},
      {from:"render",     to:"supabase", label:"④ DB 쿼리",                color:C.purple, detail:"Render → Supabase Session Pooler (IPv4)\naws-1-ap-northeast-2.pooler.supabase.com:5432"},
      {from:"supabase",   to:"render",   label:"⑤ 결과 반환",              color:C.purple, detail:"쿼리 결과 → FastAPI에서 JWT 생성\npasslib bcrypt 비밀번호 검증"},
      {from:"render",     to:"browser",  label:"⑥ JSON 응답",              color:C.green,  detail:'{ "access_token": "eyJ...", "nickname": "홍길동" }\nlocalStorage 저장 → 대시보드 이동'},
      {from:"uptimerobot",to:"render",   label:"⑦ 슬립 방지 핑 (5분마다)", color:C.yellow, detail:"GET https://ddokddok.onrender.com/health\n→ { status: ok }\n15분 슬립 타이머 리셋 → 항상 ON 상태 유지"},
    ],
  },
  signup: {
    title:"회원가입 흐름", subtitle:"비밀번호가 어떻게 안전하게 저장되는지 확인하세요",
    viewBox:"0 0 680 200",
    nodes:{
      browser:  {label:"브라우저", icon:"🌐", x:20,  y:80, w:100, h:58},
      fastapi:  {label:"FastAPI",  icon:"⚡", x:185, y:80, w:110, h:58, sub:"Render"},
      bcrypt:   {label:"bcrypt",   icon:"🔒", x:355, y:80, w:100, h:58, sub:"해시 생성"},
      supabase: {label:"Supabase", icon:"🗄️", x:510, y:80, w:110, h:58, sub:"PostgreSQL"},
    },
    lines:[
      {x1:120,y1:109,x2:185,y2:109},
      {x1:295,y1:109,x2:355,y2:109},
      {x1:455,y1:109,x2:510,y2:109},
    ],
    steps:[
      {from:"browser", to:"fastapi",  label:"① 회원가입 요청",   color:C.blue,   detail:'POST /api/auth/signup\n{ "email": "user@example.com", "nickname": "홍길동", "password": "mypassword123" }'},
      {from:"fastapi", to:"supabase", label:"② 이메일 중복 확인", color:C.yellow, detail:"SELECT * FROM users WHERE email = 'user@example.com'\n→ 없으면 진행 / 있으면 400 에러 반환"},
      {from:"supabase",to:"fastapi",  label:"③ 없음 확인",        color:C.yellow, detail:"rowcount = 0 → 가입 가능\n→ 비밀번호 해싱 단계로 진행"},
      {from:"fastapi", to:"bcrypt",   label:"④ 비밀번호 해싱",    color:C.coral,  detail:"passlib.hash.bcrypt.hash('mypassword123')\n→ 해시 라운드 12회 반복 (brute-force 방어)\n원문 비밀번호는 절대 저장하지 않음"},
      {from:"bcrypt",  to:"fastapi",  label:"⑤ 해시 반환",        color:C.coral,  detail:"'$2b$12$N9qo8uLOickgx2ZMRZoMye...'\n→ DB에 저장할 password_hash 값"},
      {from:"fastapi", to:"supabase", label:"⑥ 사용자 저장",      color:C.green,  detail:"INSERT INTO users (email, nickname, password_hash)\nVALUES ('user@example.com', '홍길동', '$2b$12$...')"},
      {from:"fastapi", to:"browser",  label:"⑦ JWT 토큰 발급",    color:C.purple, detail:'{ "access_token": "eyJhbGciOiJIUzI1NiJ9...", "nickname": "홍길동" }\n→ 자동 로그인 처리'},
    ],
  },
  aice: {
    title:"AICE 채점 흐름", subtitle:"코드 제출부터 대시보드 반영까지",
    viewBox:"0 0 680 200",
    nodes:{
      browser:  {label:"브라우저",   icon:"🌐", x:20,  y:80, w:100, h:58, sub:"코드 작성"},
      fastapi:  {label:"FastAPI",    icon:"⚡", x:185, y:80, w:110, h:58, sub:"채점 서버"},
      checker:  {label:"키워드 검사",icon:"🔍", x:355, y:80, w:110, h:58, sub:"Python"},
      supabase: {label:"Supabase",   icon:"🗄️", x:525, y:80, w:110, h:58, sub:"결과 저장"},
    },
    lines:[
      {x1:120,y1:109,x2:185,y2:109},
      {x1:295,y1:109,x2:355,y2:109},
      {x1:465,y1:109,x2:525,y2:109},
    ],
    steps:[
      {from:"browser", to:"fastapi",  label:"① 답안 제출",        color:C.blue,   detail:'POST /api/aice/submit\nAuthorization: Bearer eyJ...\n{ "question_no": 5, "code": "sns.countplot(df[\'gender\'])" }'},
      {from:"fastapi", to:"checker",  label:"② 키워드 매칭",      color:C.yellow, detail:'AICE_KEYWORDS[5] = ["countplot"]\nmissing = [k for k in keywords if k not in code]\n→ missing = [] (countplot 존재)'},
      {from:"checker", to:"fastapi",  label:"③ 채점 결과",         color:C.yellow, detail:"is_correct: True\nmissing_keywords: []\n→ 정답 처리"},
      {from:"fastapi", to:"supabase", label:"④ 결과 + 세션 저장",  color:C.green,  detail:"INSERT aice_submissions (user_id, question_no, is_correct)\nINSERT study_sessions (user_id, date, duration_minutes=5, course_id='aice')\n→ 대시보드 통계 자동 반영"},
      {from:"supabase",to:"fastapi",  label:"⑤ 저장 완료",         color:C.green,  detail:"AiceSubmission { id: 42, is_correct: true }\nStudySession { id: 15, duration_minutes: 5 }"},
      {from:"fastapi", to:"browser",  label:"⑥ 채점 결과 응답",    color:C.blue,   detail:'{ "is_correct": true, "missing_keywords": [] }\n→ 화면에 ✅ 정답 표시'},
    ],
  },
  react: {
    title:"React 렌더링 원리", subtitle:"state 변화가 화면에 반영되는 과정을 단계별로 확인하세요",
    viewBox:"0 0 680 240",
    nodes:{
      user:      {label:"사용자",        icon:"👤", x:20,  y:100, w:100, h:58},
      component: {label:"컴포넌트",      icon:"⚛️", x:175, y:100, w:110, h:58, sub:"React"},
      vdom:      {label:"Virtual DOM",   icon:"🌳", x:355, y:100, w:110, h:58, sub:"메모리"},
      differ:    {label:"Reconciler",    icon:"🔍", x:355, y:20,  w:110, h:58, sub:"Diffing"},
      dom:       {label:"실제 DOM",      icon:"🖥️", x:530, y:100, w:110, h:58, sub:"브라우저"},
    },
    lines:[
      {x1:120,y1:129,x2:175,y2:129},
      {x1:285,y1:129,x2:355,y2:129},
      {x1:410,y1:100,x2:410,y2:78},
      {x1:465,y1:49, x2:530,y2:129},
      {x1:640,y1:129,x2:640,y2:49},
    ],
    steps:[
      {from:"user",      to:"component", label:"① 이벤트 발생 → setState() 호출",           color:C.blue,   detail:"버튼 클릭, 입력 변경 등 이벤트 발생\nsetState({ count: count + 1 })\n→ React가 리렌더링 스케줄에 추가"},
      {from:"component", to:"vdom",      label:"② 컴포넌트 함수 재실행 → 새 VDOM 생성",    color:C.coral,  detail:"React가 컴포넌트 함수를 다시 호출\nreturn <div>...</div> → 새 Virtual DOM 트리 생성\n(실제 DOM 수정 없음, 메모리에서만 계산)"},
      {from:"vdom",      to:"differ",    label:"③ 이전 VDOM vs 새 VDOM 비교 (Diffing)",    color:C.yellow, detail:"React Reconciler가 두 트리를 비교\n변경된 노드만 찾아냄 (O(n) 알고리즘)\n변경 없는 자식 노드는 재사용"},
      {from:"differ",    to:"dom",       label:"④ 변경된 부분만 실제 DOM 업데이트",         color:C.green,  detail:"document.getElementById(...).textContent = '새 값'\n최소한의 DOM 조작만 수행\n→ 불필요한 리플로우/리페인트 방지"},
      {from:"dom",       to:"user",      label:"⑤ 화면 반영 → 사용자에게 보임",             color:C.purple, detail:"브라우저가 변경된 DOM을 화면에 그림 (Paint)\n사용자에게 업데이트된 UI가 표시됨\nuseEffect() 훅이 있다면 이 시점에 실행"},
    ],
  },
  oauth: {
    title:"OAuth 2.0 소셜 로그인", subtitle:"구글/카카오 로그인이 내부적으로 작동하는 방식",
    viewBox:"0 0 710 280",
    nodes:{
      user:     {label:"사용자",          icon:"👤", x:20,  y:120, w:100, h:58},
      client:   {label:"우리 앱",         icon:"💻", x:185, y:120, w:110, h:58, sub:"ddokddok"},
      authsrv:  {label:"구글 인증서버",   icon:"🔑", x:365, y:40,  w:120, h:58, sub:"accounts.google.com"},
      resource: {label:"구글 API",        icon:"📡", x:365, y:190, w:120, h:58, sub:"people.googleapis.com"},
    },
    lines:[
      {x1:120,y1:149,x2:185,y2:149},
      {x1:295,y1:149,x2:425,y2:98},
      {x1:425,y1:98, x2:295,y2:149},
      {x1:295,y1:149,x2:365,y2:219},
    ],
    steps:[
      {from:"user",     to:"client",   label:"① '구글로 로그인' 버튼 클릭",              color:C.blue,   detail:"사용자가 소셜 로그인 버튼 클릭\n우리 앱이 OAuth 인증 URL 생성\nresponse_type=code&client_id=...&redirect_uri=...&scope=email profile"},
      {from:"client",   to:"authsrv",  label:"② 구글 인증 페이지로 리다이렉트",           color:C.yellow, detail:"브라우저가 accounts.google.com/o/oauth2/auth 로 이동\n사용자가 구글 계정으로 직접 로그인\n→ 우리 앱에는 비밀번호가 전달되지 않음 (핵심!)"},
      {from:"authsrv",  to:"client",   label:"③ Authorization Code 발급 후 리다이렉트",  color:C.yellow, detail:"구글이 redirect_uri?code=4/0AX4XfW... 로 리다이렉트\nAuthorization Code는 단 1회만 사용 가능 (수명 10분)\n→ 우리 서버가 이 코드를 수신"},
      {from:"client",   to:"authsrv",  label:"④ Code → Access Token 교환 (서버-서버)",   color:C.coral,  detail:"POST https://oauth2.googleapis.com/token\n{ code, client_id, client_secret, redirect_uri }\n→ client_secret은 서버에만 보관, 클라이언트에 노출 금지"},
      {from:"authsrv",  to:"client",   label:"⑤ Access Token + Refresh Token 발급",      color:C.green,  detail:'{ "access_token": "ya29.a0ARr...", "expires_in": 3599,\n  "refresh_token": "1//06...", "token_type": "Bearer" }\nAccess Token: 1시간 유효 / Refresh Token: 장기 유효'},
      {from:"client",   to:"resource", label:"⑥ Access Token으로 사용자 정보 요청",       color:C.purple, detail:"GET https://people.googleapis.com/v1/people/me\nAuthorization: Bearer ya29.a0ARr...\n→ 구글 API가 토큰 검증 후 사용자 정보 반환"},
      {from:"resource", to:"client",   label:"⑦ 이메일·이름 수신 → 자체 JWT 발급",       color:C.blue,   detail:'{ "email": "user@gmail.com", "name": "홍길동" }\n→ 우리 DB에 없으면 자동 회원가입\n→ 자체 JWT 발급 후 로그인 완료'},
    ],
  },
  cicd: {
    title:"CI/CD 파이프라인", subtitle:"코드 push부터 실제 서비스 배포까지의 자동화 흐름",
    viewBox:"0 0 710 200",
    nodes:{
      dev:     {label:"개발자 PC",      icon:"💻", x:20,  y:80, w:105, h:58},
      github:  {label:"GitHub",         icon:"🐙", x:183, y:80, w:105, h:58, sub:"원격 저장소"},
      actions: {label:"GitHub Actions", icon:"⚙️", x:346, y:80, w:115, h:58, sub:"CI 서버"},
      vercel:  {label:"Vercel",         icon:"▲",  x:523, y:30, w:105, h:58, sub:"프론트 배포"},
      render:  {label:"Render",         icon:"⚡", x:523, y:130,w:105, h:58, sub:"백엔드 배포"},
    },
    lines:[
      {x1:125,y1:109,x2:183,y2:109},
      {x1:288,y1:109,x2:346,y2:109},
      {x1:461,y1:89, x2:523,y2:59},
      {x1:461,y1:129,x2:523,y2:159},
    ],
    steps:[
      {from:"dev",     to:"github",  label:"① git push origin main",                   color:C.blue,   detail:"git add .\ngit commit -m 'feat: 새 기능 추가'\ngit push origin main\n→ GitHub에 코드 업로드"},
      {from:"github",  to:"actions", label:"② Push 이벤트 → Actions 워크플로우 트리거", color:C.yellow, detail:".github/workflows/deploy.yml 실행\non: push: branches: [main]\n→ Ubuntu 가상 머신 자동 생성"},
      {from:"actions", to:"actions", label:"③ 빌드 & 테스트 자동 실행",                color:C.coral,  detail:"steps:\n  - uses: actions/checkout@v3\n  - run: npm install && npm run build\n  - run: npm run test\n→ 테스트 실패 시 배포 중단"},
      {from:"actions", to:"vercel",  label:"④ 프론트엔드 Vercel 자동 배포",             color:C.green,  detail:"Vercel GitHub 연동 → push 감지 즉시 배포\n빌드 명령: npm run build\n출력 디렉터리: dist/\n→ CDN 전 세계 배포 (보통 30초~2분)"},
      {from:"actions", to:"render",  label:"⑤ 백엔드 Render 자동 재시작",               color:C.purple, detail:"Render GitHub 연동 → main 브랜치 push 감지\npip install -r requirements.txt\nuvicorn main:app --host 0.0.0.0 --port $PORT\n→ Zero-downtime 배포 완료"},
    ],
  },
  rest: {
    title:"REST API 요청·응답 사이클", subtitle:"브라우저의 API 요청이 DB까지 도달하는 전체 흐름",
    viewBox:"0 0 710 200",
    nodes:{
      browser: {label:"브라우저",      icon:"🌐", x:20,  y:80, w:105, h:58},
      cors:    {label:"CORS 미들웨어", icon:"🔓", x:183, y:80, w:110, h:58, sub:"Preflight 처리"},
      auth:    {label:"JWT 인증",      icon:"🔐", x:353, y:80, w:105, h:58, sub:"토큰 검증"},
      handler: {label:"라우트 핸들러", icon:"🛤️", x:520, y:30, w:105, h:58, sub:"비즈니스 로직"},
      db:      {label:"Supabase DB",   icon:"🗄️", x:520, y:130,w:105, h:58, sub:"PostgreSQL"},
    },
    lines:[
      {x1:125,y1:109,x2:183,y2:109},
      {x1:293,y1:109,x2:353,y2:109},
      {x1:458,y1:99, x2:520,y2:59},
      {x1:458,y1:119,x2:520,y2:159},
    ],
    steps:[
      {from:"browser",  to:"cors",    label:"① HTTP 요청 전송 (Preflight OPTIONS)",    color:C.blue,   detail:"GET /api/dashboard/stats HTTP/1.1\nOrigin: https://ddokddok-phi.vercel.app\nAuthorization: Bearer eyJ...\n→ 다른 도메인이므로 브라우저가 먼저 OPTIONS 요청"},
      {from:"cors",     to:"browser", label:"② CORS 헤더로 허용 응답",                 color:C.yellow, detail:"Access-Control-Allow-Origin: *\nAccess-Control-Allow-Methods: GET, POST, PUT, DELETE\nAccess-Control-Allow-Headers: Authorization, Content-Type\n→ 브라우저가 실제 요청 전송 허가"},
      {from:"browser",  to:"auth",    label:"③ 실제 GET 요청 도착 → JWT 검증",         color:C.blue,   detail:"FastAPI가 HTTPBearer 의존성 실행\njwt.decode(token, SECRET_KEY, algorithms=['HS256'])\n→ payload: { sub: '1', exp: 1720000000 }\n만료됐거나 서명 불일치 시 401 Unauthorized"},
      {from:"auth",     to:"handler", label:"④ 인증 통과 → 라우트 핸들러 실행",        color:C.green,  detail:"current_user = db.query(User).filter(User.id == 1).first()\n→ 비즈니스 로직 실행\nstreak, weekly_minutes, completed_problems 계산"},
      {from:"handler",  to:"db",      label:"⑤ SQL 쿼리 실행",                          color:C.purple, detail:"SELECT DISTINCT date FROM study_sessions WHERE user_id=1\nSELECT date, SUM(duration) FROM ... GROUP BY date\n→ SQLAlchemy ORM이 파라미터화된 쿼리로 변환 (SQL Injection 방지)"},
      {from:"db",       to:"browser", label:"⑥ JSON 응답 반환",                         color:C.coral,  detail:'HTTP/1.1 200 OK\nContent-Type: application/json\n{\n  "streak": 5,\n  "weekly_minutes": 120,\n  "completed_problems": 14\n}'},
    ],
  },
  dashboard: {
    title:"대시보드 집계 흐름", subtitle:"연속 학습일·주간 차트가 어떻게 계산되는지",
    viewBox:"0 0 500 200",
    nodes:{
      browser: {label:"브라우저", icon:"🌐", x:20,  y:80, w:100, h:58},
      fastapi: {label:"FastAPI",  icon:"⚡", x:190, y:80, w:110, h:58, sub:"통계 집계"},
      supabase:{label:"Supabase", icon:"🗄️", x:360, y:80, w:110, h:58, sub:"PostgreSQL"},
    },
    lines:[
      {x1:120,y1:109,x2:190,y2:109},
      {x1:300,y1:109,x2:360,y2:109},
    ],
    steps:[
      {from:"browser", to:"fastapi",  label:"① 대시보드 요청",      color:C.blue,   detail:"GET /api/dashboard/stats\nAuthorization: Bearer eyJ...\nJWT 검증 → user_id = 1 확인"},
      {from:"fastapi", to:"supabase", label:"② 연속 학습일 쿼리",   color:C.green,  detail:"SELECT DISTINCT DATE(created_at) FROM study_sessions WHERE user_id=1\nSELECT DISTINCT DATE(created_at) FROM aice_submissions WHERE user_id=1"},
      {from:"supabase",to:"fastapi",  label:"③ 날짜 목록 반환",     color:C.green,  detail:"[2026-07-02, 2026-07-01, 2026-06-30, ...]\n→ streak = 3 (연속 3일 계산)"},
      {from:"fastapi", to:"supabase", label:"④ 주간 데이터 쿼리",   color:C.purple, detail:"SELECT date, SUM(duration_minutes) FROM study_sessions\nWHERE user_id=1 AND date >= '2026-06-29' (이번 주 월요일)\nGROUP BY date"},
      {from:"supabase",to:"fastapi",  label:"⑤ 주간 결과 반환",     color:C.purple, detail:"[{date:'2026-07-01', minutes:15}, ...]\n→ 월~일 7개 데이터로 바 차트 생성\n→ weekly_minutes 합산"},
      {from:"fastapi", to:"browser",  label:"⑥ 통계 응답",           color:C.blue,   detail:'{\n  "streak": 3,\n  "weekly_minutes": 45,\n  "completed_problems": 8,\n  "weekly_chart": [{"day":"월","min":0}, ...]\n}'},
    ],
  },
};

function DiagramViewer({ nodes, lines, steps, viewBox="0 0 710 220" }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(1);
  const isMobile = useIsMobile();
  const vbW = parseInt(viewBox.split(" ")[2]);
  const rafRef = useRef(null);
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setProgress(0);
    let start = null;
    const tick = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 700, 1);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [step]);
  const cur = steps[step];
  const fn = nodes[cur.from], tn = nodes[cur.to];
  const fx=fn.x+fn.w/2, fy=fn.y+fn.h/2, tx=tn.x+tn.w/2, ty=tn.y+tn.h/2;
  const px=fx+(tx-fx)*progress, py=fy+(ty-fy)*progress;
  return (
    <div style={{background:C.card,border:`1px solid ${C.line}`,borderRadius:14,padding:isMobile?12:20}}>
      <div style={{ overflowX: isMobile ? "auto" : "visible", WebkitOverflowScrolling:"touch", borderRadius:10 }}>
      <svg width={isMobile ? vbW * 0.85 : "100%"} viewBox={viewBox} style={{display:"block",minWidth:isMobile?vbW*0.85:undefined}}>
        {lines.map((l,i)=><line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={C.line} strokeWidth="1.5" strokeDasharray="5 4"/>)}
        {Object.entries(nodes).map(([id,n])=>{
          const active=cur.from===id||cur.to===id;
          return (
            <g key={id}>
              <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={10} fill={active?cur.color+"22":C.card2} stroke={active?cur.color:C.line} strokeWidth={active?2:1}/>
              <text x={n.x+n.w/2} y={n.y+22} textAnchor="middle" fontSize={16}>{n.icon}</text>
              <text x={n.x+n.w/2} y={n.y+40} textAnchor="middle" fontSize={10.5} fill={active?cur.color:C.text} fontFamily={SANS} fontWeight={active?"700":"500"}>{n.label}</text>
              {n.sub&&<text x={n.x+n.w/2} y={n.y+54} textAnchor="middle" fontSize={9} fill={C.muted} fontFamily={SANS}>{n.sub}</text>}
            </g>
          );
        })}
        <circle cx={px} cy={py} r={14} fill={cur.color} opacity={0.15}/>
        <circle cx={px} cy={py} r={7} fill={cur.color}/>
      </svg>
      </div>
      <div style={{background:C.card2,borderRadius:10,padding:isMobile?"10px 12px":"12px 16px",marginTop:12}}>
        <div style={{fontFamily:MONO,fontSize:11,color:cur.color,fontWeight:700,marginBottom:6}}>{cur.label}</div>
        <div style={{fontFamily:MONO,fontSize:11,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{cur.detail}</div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:14,alignItems:"center"}}>
        <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${C.line}`,background:"transparent",color:step===0?C.muted:C.text,fontFamily:SANS,fontSize:12,cursor:step===0?"not-allowed":"pointer"}}>← 이전</button>
        <div style={{flex:1,display:"flex",gap:4}}>
          {steps.map((_,i)=><div key={i} onClick={()=>setStep(i)} style={{flex:1,height:3,borderRadius:2,cursor:"pointer",background:i===step?cur.color:i<step?cur.color+"55":C.line}}/>)}
        </div>
        <button onClick={()=>setStep(s=>Math.min(steps.length-1,s+1))} disabled={step===steps.length-1} style={{padding:"8px 14px",borderRadius:8,border:"none",background:step===steps.length-1?C.line:C.blue,color:C.white,fontFamily:SANS,fontSize:12,cursor:step===steps.length-1?"not-allowed":"pointer"}}>다음 →</button>
      </div>
    </div>
  );
}

// ── Claude Code 폴더 구조 트리 ───────────────────
const CLAUDE_TREE = [
  { id:"claudemd",       name:"CLAUDE.md",             type:"file",   depth:0,
    summary:"Claude가 매 대화마다 자동으로 읽는 프로젝트 설명서",
    detail:"프로젝트 구조, 코딩 스타일, 금지 사항, 기술 스택 등을 적어두면 Claude가 항상 이 내용을 바탕으로 답변합니다. 팀 전체와 Git으로 공유됩니다.",
    example:"# 기술 스택\n- Frontend: React 19 + Vite\n- Backend: FastAPI + PostgreSQL\n\n# 규칙\n- console.log 커밋 금지\n- 모든 API 엔드포인트에 타입 힌트 필수\n- 커밋 메시지는 한국어로 작성" },
  { id:"claudelocalmd",  name:"CLAUDE.local.md",        type:"file",   depth:0,
    summary:"나만 사용하는 개인 메모 — 팀과 공유되지 않음",
    detail:".gitignore에 포함되어 Git에 올라가지 않습니다. 개인적인 작업 메모, 로컬 환경 특이사항, 임시 TODO 등을 자유롭게 적을 수 있습니다.",
    example:"# 내 로컬 환경\n- DB 비밀번호: (개인 메모)\n- 로컬 포트 5174 사용 중\n\n# 오늘 할 일\n- 결제 모듈 리팩토링\n- PR #42 리뷰 요청" },
  { id:"mcpjson",        name:".mcp.json",               type:"file",   depth:0,
    summary:"Claude에 외부 도구(DB·API·Slack 등)를 연결하는 MCP 설정",
    detail:"Model Context Protocol(MCP) 서버 설정 파일입니다. Claude가 데이터베이스를 직접 조회하거나 GitHub, Slack 등 외부 서비스와 연동하려면 이 파일에 서버를 등록합니다.",
    example:'{\n  "mcpServers": {\n    "supabase": {\n      "command": "npx",\n      "args": ["@supabase/mcp-server",\n               "--url", "https://xxx.supabase.co"]\n    },\n    "github": {\n      "command": "npx",\n      "args": ["@github/mcp-server"]\n    }\n  }\n}' },
  { id:"claudeDir",      name:".claude/",                type:"folder", depth:0,
    summary:"Claude Code 커스터마이징 파일이 모이는 폴더",
    detail:"Claude Code의 모든 개인화는 이 폴더에서 이루어집니다. rules, skills, commands, agents, hooks 등 Claude의 행동 방식을 세밀하게 조정할 수 있습니다.",
    example:"# .claude/ 안에 있는 항목들\nrules/      → 파일 패턴별 조건부 규칙\nskills/     → 재사용 가능한 작업 템플릿\ncommands/   → /명령어 단축키\nagents/     → 전문 역할 에이전트\nhooks/      → 이벤트 기반 자동 스크립트" },
  { id:"rules",          name:"rules/",                  type:"folder", depth:1,
    summary:"특정 파일 패턴과 매칭될 때만 자동 활성화되는 조건부 규칙",
    detail:"일반 CLAUDE.md와 달리, globs 패턴으로 지정한 파일을 다룰 때만 해당 규칙이 로드됩니다. 테스트 파일엔 테스트 규칙만, API 파일엔 설계 규칙만 적용됩니다.",
    example:"# 파일 패턴 예시\n*.test.ts   → testing.md 규칙 활성화\n**/routers/ → api-design.md 규칙 활성화\n*.sql       → sql-style.md 규칙 활성화" },
  { id:"testingmd",      name:"testing.md",              type:"file",   depth:2,
    summary:"테스트 파일을 수정할 때만 켜지는 규칙",
    detail:"globs 프론트매터로 *.test.* 패턴을 지정하면, 테스트 파일을 다룰 때만 자동 로드됩니다. 테스트 전략, 금지 패턴, 네이밍 규칙 등을 정의합니다.",
    example:"---\nglobs: [\"**/*.test.*\", \"**/*.spec.*\"]\n---\n\n# 테스트 규칙\n- Mock은 최소한으로, 실제 DB 연동 테스트 권장\n- 테스트명: 'should + 기대 동작'\n- 각 테스트는 독립적으로 실행 가능해야 함" },
  { id:"apidesignmd",    name:"api-design.md",           type:"file",   depth:2,
    summary:"백엔드 API 파일 수정 시에만 적용되는 설계 규칙",
    detail:"routers/, routes/ 패턴의 파일을 다룰 때 자동으로 활성화됩니다. API 일관성을 유지하는 규칙들을 모아둡니다.",
    example:"---\nglobs: [\"**/routers/**\", \"**/routes/**\"]\n---\n\n# API 설계 규칙\n- 모든 엔드포인트에 타입 힌트 필수\n- 에러는 HTTPException으로 통일\n- URL 패턴: /api/리소스명 (복수형)\n- 인증 필요 시 Depends(get_current_user)" },
  { id:"skills",         name:"skills/",                 type:"folder", depth:1,
    summary:"자주 쓰는 작업 패턴을 저장해두고 /명령어로 불러오는 기능",
    detail:"반복적인 작업 흐름을 미리 정의해두면 /skill-name 으로 즉시 실행할 수 있습니다. 배포 체크리스트, PR 리뷰 패턴, 버그 분석 절차 등을 저장합니다.",
    example:"# 예시 skills/\ndeploy-check.md   → /deploy-check 실행\nbug-analysis.md   → /bug-analysis 실행\npr-review.md      → /pr-review 실행\n\n# 실행 방법\n/deploy-check → 배포 전 체크리스트 자동 실행" },
  { id:"commands",       name:"commands/",               type:"folder", depth:1,
    summary:"/명령어로 쓰는 단축 프롬프트 모음",
    detail:"복잡한 프롬프트를 /명령어로 단축합니다. 팀 전체가 공통으로 사용하는 작업 명령어를 여기에 정의합니다.",
    example:"# 등록된 명령어 예시\n/fix-issue 42    → 이슈 #42 자동 수정\n/deploy-check    → 배포 전 점검\n/add-tests       → 커버리지 없는 코드에 테스트 추가\n/translate-ko    → 영문 코드를 한국어 주석 추가" },
  { id:"fixissuemd",     name:"fix-issue.md",            type:"file",   depth:2,
    summary:"GitHub 이슈를 찾아 자동으로 수정해주는 명령어",
    detail:"/fix-issue [번호] 입력 시 GitHub에서 이슈를 조회하고 관련 코드를 찾아 수정해줍니다. $ARGUMENTS로 이슈 번호를 파라미터로 받습니다.",
    example:"# GitHub 이슈 자동 수정\n\nGitHub 이슈 $ARGUMENTS 번호를 처리합니다:\n\n1. gh issue view $ARGUMENTS 로 이슈 내용 확인\n2. 관련 코드 파일 탐색\n3. 원인 파악 후 수정\n4. 커밋: 'fix: 이슈 제목 (fixes #$ARGUMENTS)'" },
  { id:"agents",         name:"agents/",                 type:"folder", depth:1,
    summary:"특정 역할만 담당하는 전문 AI 에이전트",
    detail:"각 에이전트는 자신의 역할에 맞는 도구만 사용합니다. 코드 리뷰 에이전트는 읽기만, 배포 에이전트는 실행만 허용하는 식으로 권한을 분리합니다.",
    example:"# 에이전트 종류 예시\ncode-reviewer.md  → 코드 리뷰 전담 (읽기 전용)\ntest-writer.md    → 테스트 작성 전담\ndoc-writer.md     → 문서 작성 전담\nsecurity-scan.md  → 보안 취약점 검사 전담" },
  { id:"codereviewermd", name:"code-reviewer.md",        type:"file",   depth:2,
    summary:"코드 리뷰만 전담하는 읽기 전용 AI 에이전트",
    detail:"이 에이전트는 코드를 수정하지 않고 리뷰만 합니다. Read, Grep 등 읽기 도구만 허용해 안전하게 운용합니다.",
    example:"# Code Reviewer Agent\n\n당신은 시니어 코드 리뷰어입니다.\n코드를 절대 수정하지 않습니다.\n\n## 검토 항목\n- 버그 및 논리 오류\n- 보안 취약점 (SQL Injection, XSS 등)\n- 성능 병목 지점\n- 코드 중복 및 개선 제안\n\n## 출력 형식\n각 발견사항: 파일명:줄번호 — 문제 설명 — 제안" },
  { id:"hooks",          name:"hooks/",                  type:"folder", depth:1,
    summary:"특정 이벤트 발생 시 자동으로 실행되는 쉘 스크립트",
    detail:"PreToolUse(실행 전), PostToolUse(실행 후), PostApply(파일 수정 후) 등 이벤트에 연결해 자동화합니다. 코드 포맷, 위험 명령 차단, 알림 발송 등에 활용합니다.",
    example:"# 주요 훅 이벤트\nPreToolUse   → 도구 실행 직전 (차단 가능)\nPostToolUse  → 도구 실행 직후\nPostApply    → 파일 수정 완료 후\nStop         → Claude 응답 완료 후\n\n# settings.json 연결 예시\n\"hooks\": {\n  \"PostApply\": [\".claude/hooks/format.sh\"]\n}" },
  { id:"formatonsave",   name:"format-on-save.sh",       type:"file",   depth:2,
    summary:"Claude가 파일 수정 후 자동으로 코드 포맷을 실행하는 훅",
    detail:"PostApply 이벤트에 연결해두면 Claude가 파일을 수정한 직후 자동으로 prettier, black, gofmt 등 포맷터가 실행됩니다.",
    example:"#!/bin/bash\n# PostApply 훅 — 자동 코드 포맷\n\nfor FILE in $CLAUDE_FILE_PATHS; do\n  if [[ \"$FILE\" == *.py ]]; then\n    black \"$FILE\" && isort \"$FILE\"\n  elif [[ \"$FILE\" == *.ts ]] || [[ \"$FILE\" == *.tsx ]]; then\n    prettier --write \"$FILE\"\n  elif [[ \"$FILE\" == *.go ]]; then\n    gofmt -w \"$FILE\"\n  fi\ndone" },
  { id:"blocksecrets",   name:"block-secrets.sh",        type:"file",   depth:2,
    summary:"위험한 명령어 실행을 사전에 차단하는 보안 훅",
    detail:"PreToolUse 이벤트에 연결해 rm -rf, DROP TABLE, 시크릿 노출 명령 등을 Claude가 실행하기 전에 자동 차단합니다. exit 1 반환 시 실행이 막힙니다.",
    example:"#!/bin/bash\n# PreToolUse 훅 — 위험 명령 차단\n\nCMD=\"$CLAUDE_TOOL_INPUT\"\n\n# 위험 패턴 검사\nif echo \"$CMD\" | grep -qE '(rm -rf /|DROP TABLE|DELETE FROM [^W])'; then\n  echo \"⛔ 위험 명령이 감지되어 차단됩니다\"\n  echo \"명령: $CMD\"\n  exit 1\nfi\n\nexit 0  # 허용" },
  { id:"outputstyles",   name:"output-styles/",          type:"folder", depth:1,
    summary:"Claude 답변의 형식·언어·말투·상세도를 설정하는 폴더",
    detail:"간결 모드, 상세 모드, 코드 우선 모드, 한국어 모드 등 다양한 출력 스타일을 미리 정의해두고 필요에 따라 전환합니다.",
    example:"# 스타일 예시\nconcise.md      → 핵심만 1-2줄로\ndetailed.md     → 단계별 상세 설명\ncode-first.md   → 코드 먼저, 설명 나중\nkorean.md       → 모든 답변 한국어로\njunior.md       → 초보자 눈높이 설명" },
  { id:"workflows",      name:"workflows/",              type:"folder", depth:1,
    summary:"여러 에이전트를 순서대로 실행하는 자동화 파이프라인",
    detail:"복잡한 작업을 여러 에이전트가 이어받아 처리합니다. 예: 코드 작성 에이전트 → 테스트 에이전트 → 리뷰 에이전트 순으로 자동 실행됩니다.",
    example:"# full-pr-workflow.md 예시\n\n## 1단계: 코드 작성\n$AGENT(code-writer): 기능 구현\n\n## 2단계: 테스트 추가\n$AGENT(test-writer): 테스트 작성\n\n## 3단계: 코드 리뷰\n$AGENT(code-reviewer): 리뷰 및 수정 제안\n\n## 4단계: PR 생성\ngh pr create --title '...' --body '...'" },
  { id:"agentmemory",    name:"agent-memory/",           type:"folder", depth:1,
    summary:"에이전트가 대화 간 기억을 유지하는 자동 생성 폴더",
    detail:"Claude Code가 자동으로 만드는 폴더입니다. 에이전트가 이전 대화에서 학습한 내용, 프로젝트 컨텍스트, 사용자 선호도 등을 파일로 저장해 다음 대화에서 활용합니다.",
    example:"# 자동 생성 파일 예시\nuser_preferences.md  → 사용자 코딩 스타일 기억\nproject_context.md   → 현재 진행 중인 작업 기억\nerrors_seen.md       → 자주 나타나는 오류 패턴\n\n# 직접 저장 명령\n'이 내용 기억해줘' → 에이전트가 자동 저장" },
  { id:"settingsjson",   name:"settings.json",           type:"file",   depth:0,
    summary:"Claude Code 권한·훅·모델·환경변수 전체 설정",
    detail:"허용/차단 명령어, 훅 연결, 기본 모델 등을 정의합니다. 팀 전체와 Git으로 공유되는 공식 설정입니다.",
    example:'{\n  "permissions": {\n    "allow": [\n      "Bash(npm run *)",\n      "Bash(git add|commit|push)"\n    ],\n    "deny": ["Bash(rm -rf *)"]\n  },\n  "hooks": {\n    "PostApply": [".claude/hooks/format.sh"],\n    "PreToolUse": [".claude/hooks/block-secrets.sh"]\n  },\n  "model": "claude-sonnet-4-6"\n}' },
  { id:"settingslocaljson", name:"settings.local.json",  type:"file",   depth:0,
    summary:"나만 쓰는 설정 오버라이드 — Git 제외, 개인 전용",
    detail:"settings.json을 개인적으로 덮어씁니다. 개인 API 키, 로컬 전용 환경변수, 개인 선호 모델 등을 여기에 넣습니다. .gitignore에 포함됩니다.",
    example:'{\n  "env": {\n    "ANTHROPIC_API_KEY": "sk-ant-api03-..."\n  },\n  "model": "claude-opus-4-8",\n  "permissions": {\n    "allow": [\n      "Bash(brew *)",\n      "Bash(open *)"\n    ]\n  }\n}' },
];

function FolderTreeViewer() {
  const [selected, setSelected] = useState("claudemd");
  const isMobile = useIsMobile();
  const item = CLAUDE_TREE.find(n => n.id === selected);

  const tree = (
    <div style={{ background:C.card2, borderRadius:10, padding:14, border:`1px solid ${C.line}`, overflowY:"auto", maxHeight: isMobile ? 260 : 560 }}>
      <div style={{ fontFamily:MONO, fontSize:10, color:C.muted, marginBottom:8, paddingLeft:4 }}>📁 project/</div>
      {CLAUDE_TREE.map(node => {
        const active = selected === node.id;
        const isFolder = node.type === "folder";
        return (
          <button key={node.id} onClick={() => setSelected(node.id)} style={{
            display:"flex", alignItems:"center", gap:6,
            width:"100%", padding:"5px 8px", borderRadius:6, border:"none",
            paddingLeft: 8 + node.depth * 18,
            background: active ? C.blue+"22" : "transparent",
            color: active ? C.blue : isFolder ? C.yellow : C.text,
            cursor:"pointer", textAlign:"left",
            borderLeft: active ? `2px solid ${C.blue}` : "2px solid transparent",
            transition:"background 0.1s",
          }}>
            <span style={{ fontSize:11 }}>{isFolder ? "📁" : "📄"}</span>
            <span style={{ fontFamily:MONO, fontSize:11, fontWeight: active ? 700 : 400, whiteSpace:"nowrap" }}>{node.name}</span>
          </button>
        );
      })}
    </div>
  );

  const detail = item && (
    <div style={{ background:C.card2, borderRadius:10, padding:20, border:`1px solid ${C.line}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <span style={{ fontSize:22 }}>{item.type === "folder" ? "📁" : "📄"}</span>
        <div style={{ fontFamily:MONO, fontSize:15, fontWeight:700, color:C.blue }}>{item.name}</div>
      </div>
      <div style={{ fontFamily:SANS, fontSize:13, color:C.text, fontWeight:600, marginBottom:10, lineHeight:1.6 }}>
        {item.summary}
      </div>
      <div style={{ fontFamily:SANS, fontSize:12, color:C.muted, lineHeight:1.8, marginBottom:14 }}>
        {item.detail}
      </div>
      <div style={{ background:"#0D1117", borderRadius:8, padding:"12px 14px", overflowX:"auto" }}>
        <div style={{ fontFamily:MONO, fontSize:10, color:C.muted, marginBottom:6 }}>예시</div>
        <pre style={{ fontFamily:MONO, fontSize:11, color:C.green, lineHeight:1.75, margin:0, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{item.example}</pre>
      </div>
    </div>
  );

  if (isMobile) return <div style={{ display:"flex", flexDirection:"column", gap:12 }}>{tree}{detail}</div>;
  return <div style={{ display:"grid", gridTemplateColumns:"240px 1fr", gap:14 }}>{tree}{detail}</div>;
}

// ── 더미 선언 (이전 코드 호환용, 실제 사용 안 함) ──
const ARCH_NODES = {};

const ARCH_DIAGRAMS = [
  { id:"jwt",       title:"JWT 인증 흐름",        desc:"로그인 → 토큰 발급 → API 호출 흐름",              icon:"🔐", available:true },
  { id:"infra",     title:"배포 인프라 구조",      desc:"Vercel → Render → Supabase + UptimeRobot",        icon:"🚀", available:true },
  { id:"signup",    title:"회원가입 흐름",          desc:"비밀번호 해싱(bcrypt) → DB 저장 → JWT 발급",      icon:"👤", available:true },
  { id:"aice",      title:"AICE 채점 흐름",        desc:"코드 제출 → 키워드 검사 → 결과 저장",             icon:"📝", available:true },
  { id:"dashboard", title:"대시보드 집계 흐름",    desc:"연속 학습일 · 주간 차트 계산 과정",               icon:"📊", available:true },
  { id:"react",     title:"React 렌더링 원리",     desc:"setState → Virtual DOM Diffing → 실제 DOM 업데이트", icon:"⚛️", available:true },
  { id:"oauth",     title:"OAuth 2.0 소셜 로그인", desc:"구글 로그인이 내부에서 작동하는 방식 7단계",      icon:"🔑", available:true },
  { id:"cicd",      title:"CI/CD 파이프라인",      desc:"git push → GitHub Actions → Vercel/Render 자동 배포", icon:"⚙️", available:true },
  { id:"rest",      title:"REST API 사이클",       desc:"CORS → JWT 인증 → 라우트 핸들러 → DB → JSON 응답", icon:"🌐", available:true },
  { id:"claudetree", title:"Claude Code 폴더 구조", desc:"각 파일과 폴더의 역할을 클릭으로 확인하세요",        icon:"📁", available:true },
];

function ArchScreen() {
  const [selected, setSelected] = useState(null);
  const d = selected && DIAGRAMS[selected];

  if (selected === "claudetree") return (
    <div style={{ padding:"32px 32px 60px" }}>
      <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:C.muted, fontFamily:SANS, fontSize:13, cursor:"pointer", marginBottom:16, padding:0 }}>← 아키텍처 목록</button>
      <div style={{ fontFamily:SANS, fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>📁 Claude Code 폴더 구조</div>
      <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom:24 }}>각 파일과 폴더를 클릭해서 역할과 예시를 확인하세요</div>
      <FolderTreeViewer />
    </div>
  );

  if (d) return (
    <div style={{ padding:"32px 32px 60px" }}>
      <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:C.muted, fontFamily:SANS, fontSize:13, cursor:"pointer", marginBottom:16, padding:0 }}>← 아키텍처 목록</button>
      <div style={{ fontFamily:SANS, fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>{d.title}</div>
      <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom:20 }}>{d.subtitle}</div>
      <DiagramViewer nodes={d.nodes} lines={d.lines} steps={d.steps} viewBox={d.viewBox}/>
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
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", topic: "" });
  const [formErr, setFormErr] = useState("");
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`${API}/api/study/groups`, { headers: authHeader() })
      .then(r => r.json())
      .then(data => { setGroups(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const createGroup = async () => {
    if (!form.name.trim()) { setFormErr("그룹 이름을 입력하세요"); return; }
    setCreating(true);
    try {
      const res = await fetch(`${API}/api/study/groups`, {
        method: "POST", headers: { "Content-Type":"application/json", ...authHeader() },
        body: JSON.stringify({ name: form.name, topic: form.topic }),
      });
      if (!res.ok) { const d = await res.json(); setFormErr(d.detail || "오류가 발생했습니다"); return; }
      setForm({ name: "", topic: "" });
      setFormErr("");
      setShowCreate(false);
      load();
    } catch { setFormErr("서버에 연결할 수 없습니다"); }
    finally { setCreating(false); }
  };

  const joinGroup = async (id) => {
    await fetch(`${API}/api/study/groups/${id}/join`, { method:"POST", headers: authHeader() });
    load();
  };

  const checkin = async (id) => {
    await fetch(`${API}/api/study/groups/${id}/checkin`, { method:"POST", headers: authHeader() });
    load();
  };

  const leaveGroup = async (id) => {
    if (!window.confirm("그룹에서 탈퇴하시겠습니까?")) return;
    await fetch(`${API}/api/study/groups/${id}/leave`, { method:"DELETE", headers: authHeader() });
    load();
  };

  const deleteGroup = async (id, name) => {
    if (!window.confirm(`"${name}" 그룹을 삭제하시겠습니까?\n모든 멤버의 체크인 기록도 함께 삭제됩니다.`)) return;
    await fetch(`${API}/api/study/groups/${id}`, { method:"DELETE", headers: authHeader() });
    load();
  };

  const inp = (placeholder, key) => (
    <input
      placeholder={placeholder} value={form[key]}
      onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setFormErr(""); }}
      style={{
        width:"100%", padding:"10px 14px", borderRadius:8, border:`1px solid ${C.line}`,
        background:C.card2, color:C.text, fontFamily:SANS, fontSize:13, outline:"none",
        boxSizing:"border-box", marginBottom:10,
      }}
    />
  );

  return (
    <div style={{ padding:"32px 32px 60px" }}>
      {showCreate && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div style={{ width:340, background:C.card, borderRadius:16, padding:"28px 28px", border:`1px solid ${C.line}` }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div style={{ fontFamily:SANS, fontSize:16, fontWeight:800, color:C.text }}>새 스터디 그룹</div>
              <button onClick={() => setShowCreate(false)} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer" }}><X size={18}/></button>
            </div>
            {inp("그룹 이름 (예: AICE 합격 스터디)", "name")}
            {inp("오늘의 주제 (선택)", "topic")}
            {formErr && <div style={{ fontFamily:SANS, fontSize:12, color:C.coral, marginBottom:10 }}>{formErr}</div>}
            <button onClick={createGroup} disabled={creating} style={{
              width:"100%", padding:"11px 0", borderRadius:8, border:"none",
              background:C.blue, color:C.white, fontFamily:SANS, fontSize:13, fontWeight:700, cursor:"pointer",
            }}>{creating ? "만드는 중…" : "그룹 만들기"}</button>
          </div>
        </div>
      )}

      <div style={{ fontFamily:SANS, fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>스터디 그룹</div>
      <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, marginBottom:24 }}>팀원의 오늘 학습 여부를 확인하고 서로 자극받아요</div>

      {loading ? (
        <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, textAlign:"center", paddingTop:40 }}>불러오는 중…</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {groups.length === 0 && (
            <div style={{ fontFamily:SANS, fontSize:13, color:C.muted, textAlign:"center", padding:"40px 0" }}>
              아직 스터디 그룹이 없어요. 먼저 만들어보세요!
            </div>
          )}
          {groups.map((g) => (
            <div key={g.id} style={{ background:C.card, border:`1px solid ${g.is_member ? C.blue+"44" : C.line}`, borderRadius:14, padding:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div style={{ flex:1, minWidth:0, marginRight:10 }}>
                  <div style={{ fontFamily:SANS, fontSize:15, fontWeight:700, color:C.text }}>{g.name}</div>
                  {g.topic && <div style={{ fontFamily:MONO, fontSize:11, color:C.muted, marginTop:3 }}>📌 {g.topic}</div>}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:5, fontFamily:MONO, fontSize:12, color:C.yellow, flexShrink:0 }}>
                  🔥 {g.streak}일
                </div>
              </div>

              {/* 멤버 체크인 현황 */}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
                {g.members.map((m, i) => (
                  <div key={i} title={m.nickname} style={{
                    display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                  }}>
                    <div style={{
                      width:38, height:38, borderRadius:10,
                      background: m.checked_in_today ? C.green+"33" : C.card2,
                      border: `1.5px solid ${m.checked_in_today ? C.green : C.line}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:MONO, fontSize:13, fontWeight:700,
                      color: m.checked_in_today ? C.green : C.muted,
                    }}>
                      {m.checked_in_today ? "✓" : m.nickname[0]?.toUpperCase()}
                    </div>
                    <div style={{ fontFamily:SANS, fontSize:9, color:C.muted, maxWidth:38, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.nickname}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontFamily:MONO, fontSize:10.5, color:C.muted, marginBottom:14 }}>
                {g.members.filter(m => m.checked_in_today).length}/{g.member_count}명 오늘 학습 완료
              </div>

              {/* 액션 버튼 */}
              <div style={{ display:"flex", gap:8 }}>
                {!g.is_member ? (
                  <button onClick={() => joinGroup(g.id)} style={{
                    flex:1, padding:"9px 0", borderRadius:8, border:"none",
                    background:C.blue, color:C.white, fontFamily:SANS, fontSize:12, fontWeight:700, cursor:"pointer",
                  }}>참가하기</button>
                ) : (
                  <>
                    <button onClick={() => checkin(g.id)} disabled={g.checked_in_today} style={{
                      flex:1, padding:"9px 0", borderRadius:8, border:"none",
                      background: g.checked_in_today ? C.green+"44" : C.green,
                      color: g.checked_in_today ? C.green : C.white,
                      fontFamily:SANS, fontSize:12, fontWeight:700,
                      cursor: g.checked_in_today ? "default" : "pointer",
                    }}>
                      {g.checked_in_today ? "✓ 오늘 완료" : "오늘 학습 완료"}
                    </button>
                    {g.is_creator ? (
                      <button onClick={() => deleteGroup(g.id, g.name)} style={{
                        padding:"9px 12px", borderRadius:8, border:`1px solid ${C.coral}44`,
                        background:"transparent", color:C.coral, fontFamily:SANS, fontSize:12, cursor:"pointer",
                      }}>삭제</button>
                    ) : (
                      <button onClick={() => leaveGroup(g.id)} style={{
                        padding:"9px 12px", borderRadius:8, border:`1px solid ${C.line}`,
                        background:"transparent", color:C.muted, fontFamily:SANS, fontSize:12, cursor:"pointer",
                      }}>탈퇴</button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          <button onClick={() => setShowCreate(true)} style={{
            padding:"16px", borderRadius:14, border:`1.5px dashed ${C.line}`,
            background:"transparent", color:C.muted, fontFamily:SANS, fontSize:13, fontWeight:600, cursor:"pointer",
          }}>+ 새 스터디 그룹 만들기</button>
        </div>
      )}
    </div>
  );
}

// ── 루트 ────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [nickname, setNickname] = useState(() => localStorage.getItem("nickname"));
  const [isGuest, setIsGuest] = useState(() => !localStorage.getItem("token") && sessionStorage.getItem("guest") === "1");
  const [showSettings, setShowSettings] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [screenKeys, setScreenKeys] = useState({ home:0, code:0, cert:0, arch:0, study:0 });
  const isMobile = useIsMobile();

  const BANNER_H = 36;

  const handleAuth = (nick) => {
    setNickname(nick);
    setIsGuest(false);
    sessionStorage.removeItem("guest");
  };
  const handleGuest = () => {
    sessionStorage.setItem("guest", "1");
    setIsGuest(true);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nickname");
    setNickname(null);
    setIsGuest(false);
    sessionStorage.removeItem("guest");
  };
  const handleBackToLogin = () => {
    setIsGuest(false);
    sessionStorage.removeItem("guest");
    setShowStudyModal(false);
  };

  const handleSetTab = (t) => {
    if (t === "study" && isGuest) { setShowStudyModal(true); return; }
    if (t === tab) {
      setScreenKeys(k => ({ ...k, [t]: k[t] + 1 }));
    }
    setTab(t);
  };

  if (!nickname && !isGuest) return <AuthScreen onAuth={handleAuth} onGuest={handleGuest} />;

  const showBanner = isGuest && !bannerDismissed;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      {showBanner && <GuestBanner onLogin={handleBackToLogin} onDismiss={() => setBannerDismissed(true)} />}
      {showStudyModal && <StudyLoginModal onLogin={handleBackToLogin} onClose={() => setShowStudyModal(false)} />}
      {showSettings && !isGuest && <SettingsModal nickname={nickname} onClose={() => setShowSettings(false)} onNicknameChange={setNickname} onLogout={handleLogout} />}
      <Nav tab={tab} setTab={handleSetTab} nickname={nickname} onLogout={handleLogout} onSettings={() => setShowSettings(true)} isGuest={isGuest} />
      <div style={{ marginLeft:isMobile?0:200, paddingBottom:isMobile?70:0, flex:1, overflowY:"auto", paddingTop: showBanner ? BANNER_H : 0 }}>
        {tab === "home"  && <HomeScreen key={screenKeys.home} setTab={handleSetTab} nickname={nickname} onSettings={() => setShowSettings(true)} onLogout={handleLogout} isGuest={isGuest} onLogin={handleBackToLogin} />}
        {tab === "code"  && <CodeScreen key={screenKeys.code} isGuest={isGuest} />}
        {tab === "cert"  && <CertScreen key={screenKeys.cert} />}
        {tab === "arch"  && <ArchScreen key={screenKeys.arch} />}
        {tab === "study" && !isGuest && <StudyScreen key={screenKeys.study} />}
      </div>
    </div>
  );
}
