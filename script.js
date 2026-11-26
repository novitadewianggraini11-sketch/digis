
// =====================================
// NAVIGASI HALAMAN
// =====================================

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.getElementById(pageId).classList.add("active");

    window.scrollTo(0, 0);

    if (pageId === "dashboard") {
        loadDashboard();
    }
}

// =====================================
// DATA PENGGUNA
// =====================================

function getUsers() {
    return JSON.parse(localStorage.getItem("digismart_users")) || [];
}

function getCurrentUser() {
    const email = sessionStorage.getItem("digismart_user");

    if (!email) return null;

    return getUsers().find(user => user.email === email) || null;
}

function saveUser(updatedUser) {
    const users = getUsers();
    const index = users.findIndex(user => user.email === updatedUser.email);

    if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem("digismart_users", JSON.stringify(users));
    }
}

// =====================================
// REGISTER
// =====================================

document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;

    const users = getUsers();

    if (password.length < 8) {
        document.getElementById("registerMessage").textContent =
            "Kata sandi minimal 8 karakter!";
        return;
    }

    if (users.some(user => user.email === email)) {
        document.getElementById("registerMessage").textContent =
            "Email sudah terdaftar!";
        return;
    }

    users.push({
        name,
        email,
        password,
        score: 0,
        quizCount: 0,
        materialCount: 0
    });

    localStorage.setItem("digismart_users", JSON.stringify(users));

    document.getElementById("registerMessage").textContent =
        "Pendaftaran berhasil! Silakan masuk.";

    this.reset();
});

// =====================================
// LOGIN
// =====================================

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const user = getUsers().find(item =>
        item.email === email && item.password === password
    );

    if (user) {
        sessionStorage.setItem("digismart_user", email);
        showPage("dashboard");
    } else {
        document.getElementById("loginMessage").textContent =
            "Email atau kata sandi salah!";
    }
});

// =====================================
// DASHBOARD
// =====================================

function loadDashboard() {
    const user = getCurrentUser();

    if (!user) {
        showPage("login");
        return;
    }

    document.getElementById("userName").textContent = user.name;
    document.getElementById("materialCount").textContent = user.materialCount;
    document.getElementById("quizCount").textContent = user.quizCount;
    document.getElementById("totalScore").textContent = user.score;
}

// =====================================
// MATERI
// =====================================

function completeMaterial() {
    const user = getCurrentUser();

    if (!user) return;

    if (user.materialCount >= 1) {
        alert("Materi sudah pernah diselesaikan!");
        return;
    }

    user.materialCount = 1;
    saveUser(user);

    alert("Selamat! Materi berhasil diselesaikan.");

    showPage("dashboard");
}

// =====================================
// LOGOUT
// =====================================

function logout() {
    sessionStorage.removeItem("digismart_user");
    showPage("home");
}

// =====================================
// KUIS DIGITAL
// =====================================

const questions = [
    {
        question: "Apa yang dimaksud dengan hoaks?",
        options: [
            "Informasi benar",
            "Informasi palsu",
            "Informasi pendidikan",
            "Informasi resmi"
        ],
        answer: 1
    },
    {
        question: "Bagaimana cara menjaga keamanan akun?",
        options: [
            "Membagikan password",
            "Menggunakan password kuat",
            "Menggunakan password sama",
            "Membagikan kode OTP"
        ],
        answer: 1
    },
    {
        question: "Apa yang dimaksud dengan jejak digital?",
        options: [
            "Rekaman aktivitas internet",
            "Jenis komputer",
            "Aplikasi permainan",
            "Jaringan internet"
        ],
        answer: 0
    },
    {
        question: "Apa yang harus dilakukan sebelum membagikan berita?",
        options: [
            "Langsung membagikan",
            "Memeriksa kebenaran berita",
            "Mengubah isi berita",
            "Mengabaikan sumber"
        ],
        answer: 1
    },
    {
        question: "Bagaimana menggunakan AI secara bijak?",
        options: [
            "Memercayai semua hasilnya",
            "Menyalin semua jawaban",
            "Memeriksa hasil AI",
            "Membagikan data pribadi"
        ],
        answer: 2
    }
];

let questionIndex = 0;
let selectedAnswers = [];

function startQuiz() {
    if (!getCurrentUser()) {
        showPage("login");
        return;
    }

    questionIndex = 0;
    selectedAnswers = [];

    showPage("kuis");
    showQuestion();
}

function showQuestion() {
    const q = questions[questionIndex];

    document.getElementById("questionNumber").textContent =
        `Pertanyaan ${questionIndex + 1} dari ${questions.length}`;

    document.getElementById("questionText").textContent = q.question;

    document.getElementById("answerOptions").innerHTML =
        q.options.map((option, index) => `
            <label>
                <input type="radio" name="answer" value="${index}">
                ${option}
            </label>
        `).join("");

    document.getElementById("quizMessage").textContent = "";
    document.getElementById("nextButton").style.display = "inline-block";
    document.getElementById("nextButton").textContent =
        questionIndex === questions.length - 1
        ? "Selesaikan Kuis"
        : "Selanjutnya";

    document.getElementById("quizResult").innerHTML = "";
}

function nextQuestion() {
    const selected = document.querySelector(
        'input[name="answer"]:checked'
    );

    if (!selected) {
        document.getElementById("quizMessage").textContent =
            "Silakan pilih jawaban terlebih dahulu!";
        return;
    }

    selectedAnswers.push(Number(selected.value));

    questionIndex++;

    if (questionIndex < questions.length) {
        showQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    const correct = questions.filter((q, index) =>
        q.answer === selectedAnswers[index]
    ).length;

    const score = correct * 20;

    const user = getCurrentUser();

    if (user) {
        user.score += score;
        user.quizCount += 1;
        saveUser(user);
    }

    document.getElementById("questionNumber").textContent = "";
    document.getElementById("questionText").textContent = "";
    document.getElementById("answerOptions").innerHTML = "";
    document.getElementById("nextButton").style.display = "none";

    document.getElementById("quizResult").innerHTML = `
        <h2>🎉 Kuis Selesai!</h2>
        <p>Jawaban benar: ${correct} dari ${questions.length}</p>
        <h1>Nilai: ${score}</h1>
        <button class="btn-main" onclick="showPage('dashboard')">
            Kembali ke Dashboard
        </button>
    `;
}

// =====================================
// OTOMATISASI AWAL
// =====================================

if (getCurrentUser()) {
    showPage("dashboard");
} else {
    showPage("home");
}
