// ===============================
// QRNISH OTP SYSTEM
// ===============================

let generatedOTP = null;
let otpVerified = false;

// ===============================
// Get HTML Elements
// ===============================

const sendOtpBtn = document.getElementById("send-otp-btn");
const resendOtpBtn = document.getElementById("resend-otp-btn");
const verifyOtpBtn = document.getElementById("verify-otp-btn");

const otpContainer = document.getElementById("otp-container");
const otpInput = document.getElementById("otp");

const registerForm = document.getElementById("registerForm");
const mobileInput = document.getElementById("mobile");


// ===============================
// Generate OTP
// ===============================

function generateOTP() {

    generatedOTP = Math.floor(
        100000 + Math.random() * 900000
    );

    console.log("QRNISH OTP:", generatedOTP);
}


// ===============================
// Send OTP
// ===============================

sendOtpBtn.addEventListener("click", function () {

    let mobile = mobileInput.value.trim();

    // Check mobile number
    if (mobile === "") {
        alert("Please enter your mobile number");
        return;
    }

    if (!/^\d{10}$/.test(mobile)) {
        alert("Please enter a valid 10-digit mobile number");
        return;
    }

    // Generate OTP
    generateOTP();

    // Show OTP box
    otpContainer.style.display = "block";

    // Change button
    sendOtpBtn.innerText = "OTP Sent";
    sendOtpBtn.disabled = true;

    // Reset verification
    otpVerified = false;

    verifyOtpBtn.innerText = "Verify";

    // For development/testing only
    alert("OTP generated. Check browser console.");

});


// ===============================
// Verify OTP
// ===============================

verifyOtpBtn.addEventListener("click", function () {

    let enteredOTP = otpInput.value.trim();

    // Check empty OTP
    if (enteredOTP === "") {
        alert("Please enter the OTP");
        return;
    }

    // Check 6 digits
    if (!/^\d{6}$/.test(enteredOTP)) {
        alert("OTP must contain 6 digits");
        return;
    }

    // Verify
    if (enteredOTP === String(generatedOTP)) {

        otpVerified = true;

        verifyOtpBtn.innerText = "Verified ✓";

        verifyOtpBtn.classList.remove("failed");

        verifyOtpBtn.classList.add("verified");

        resendOtpBtn.style.display = "none";

        otpInput.disabled = true;

        alert("Mobile number verified successfully!");

    } 
    
    else {

        otpVerified = false;

        verifyOtpBtn.innerText = "Invalid OTP";

        verifyOtpBtn.classList.remove("verified");

        verifyOtpBtn.classList.add("failed");

        resendOtpBtn.style.display = "block";

    }

});


// ===============================
// Resend OTP
// ===============================

resendOtpBtn.addEventListener("click", function () {

    generateOTP();

    otpInput.value = "";

    otpInput.disabled = false;

    verifyOtpBtn.innerText = "Verify";

    verifyOtpBtn.classList.remove("failed");

    verifyOtpBtn.classList.remove("verified");

    resendOtpBtn.style.display = "none";

    otpVerified = false;

    alert("New OTP generated. Check browser console.");

});


// ===============================
// Register Account
// ===============================

registerForm.addEventListener("submit", function (e) {

    e.preventDefault();

    let name =
        document.getElementById("fullname").value.trim();

    let mobile =
        document.getElementById("mobile").value.trim();

    let email =
        document.getElementById("email").value.trim();

    let password =
        document.getElementById("password").value;

    let confirmPassword =
        document.getElementById("confirm-password").value;


    // ===============================
    // Name
    // ===============================

    if (name === "") {

        alert("Please enter your name");

        return;
    }


    // ===============================
    // Mobile
    // ===============================

    if (!/^\d{10}$/.test(mobile)) {

        alert("Enter a valid 10-digit mobile number");

        return;
    }


    // ===============================
    // OTP
    // ===============================

    if (!otpVerified) {

        alert("Please verify your mobile number with OTP");

        return;
    }


    // ===============================
    // Email
    // ===============================

    let emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        alert("Enter a valid email address");

        return;
    }


    // ===============================
    // Password
    // ===============================

    if (password !== confirmPassword) {

        alert("Passwords do not match");

        return;
    }


    // ===============================
    // Everything OK
    // ===============================

    alert("Registration successful!");

    window.location.href = "home.html";

});