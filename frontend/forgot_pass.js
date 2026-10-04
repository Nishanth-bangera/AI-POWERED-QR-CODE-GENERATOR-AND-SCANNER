// ====================================
// QRNISH FORGOT PASSWORD
// ====================================


// ------------------------------------
// VARIABLES
// ------------------------------------

let otpVerified = false;


// ------------------------------------
// ELEMENTS
// ------------------------------------

const forgotForm = document.getElementById("forgotForm");

const emailInput = document.getElementById("email");

const sendOtpBtn = document.getElementById("send-otp-btn");

const resendOtpBtn = document.getElementById("resend-otp-btn");

const verifyOtpBtn = document.getElementById("verify-otp-btn");

const otpContainer = document.getElementById("otp-container");

const otpInput = document.getElementById("otp");

const otpStatus = document.getElementById("otp-status");

const passwordSection = document.getElementById("password-section");

const passwordInput = document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirm-password");

const resetPasswordBtn =
    document.getElementById("reset-password-btn");


// ------------------------------------
// SEND OTP
// ------------------------------------

async function sendOTP() {

    const email = emailInput.value.trim();


    // Check email
    if (email === "") {

        alert("Please enter your email address.");

        return;

    }


    // Check email format
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        alert("Please enter a valid email address.");

        return;

    }


    // Disable button
    sendOtpBtn.disabled = true;

    sendOtpBtn.innerText = "Sending...";


    try {

        const response = await fetch(
            "http://127.0.0.1:8000/forgot-password/send-otp",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email
                })

            }
        );


        const data = await response.json();


        if (data.success) {

            // Show OTP section
            otpContainer.style.display = "block";


            // Reset OTP state
            otpVerified = false;

            otpInput.value = "";

            otpStatus.innerText =
                "OTP sent to your email.";


            // Button changes
            sendOtpBtn.innerText = "OTP Sent";


            // Show resend
            resendOtpBtn.style.display = "block";


            // Hide password section
            passwordSection.style.display = "none";


            alert("OTP sent successfully.");

        }

        else {

            alert(data.message);

            sendOtpBtn.disabled = false;

            sendOtpBtn.innerText = "Send OTP";

        }

    }

    catch (error) {

        console.error(
            "Send OTP error:",
            error
        );


        alert(
            "Unable to connect to the server."
        );


        sendOtpBtn.disabled = false;

        sendOtpBtn.innerText = "Send OTP";

    }

}


// ------------------------------------
// SEND OTP BUTTON
// ------------------------------------

sendOtpBtn.addEventListener(
    "click",
    sendOTP
);


// ------------------------------------
// RESEND OTP
// ------------------------------------

resendOtpBtn.addEventListener(
    "click",
    async function () {

        // Clear old OTP
        otpInput.value = "";


        // Reset verification
        otpVerified = false;


        // Reset verify button
        verifyOtpBtn.innerText = "Verify";

        verifyOtpBtn.classList.remove(
            "verified"
        );

        verifyOtpBtn.classList.remove(
            "failed"
        );


        otpStatus.innerText =
            "Sending new OTP...";


        // Hide password section
        passwordSection.style.display =
            "none";


        // Send new OTP
        await sendOTP();

    }
);


// ------------------------------------
// VERIFY OTP
// ------------------------------------

verifyOtpBtn.addEventListener(
    "click",
    async function () {

        const email =
            emailInput.value.trim();

        const otp =
            otpInput.value.trim();


        // Check OTP
        if (otp === "") {

            alert("Please enter the OTP.");

            return;

        }


        if (!/^\d{6}$/.test(otp)) {

            alert(
                "OTP must contain 6 digits."
            );

            return;

        }


        verifyOtpBtn.disabled = true;

        verifyOtpBtn.innerText =
            "Verifying...";


        try {

            const response = await fetch(
                "http://127.0.0.1:8000/forgot-password/verify-otp",
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        email: email,

                        otp: otp,

                        password: "temporary"

                    })

                }
            );


            const data =
                await response.json();


            if (data.success) {

                otpVerified = true;


                verifyOtpBtn.innerText =
                    "Verified ✓";


                verifyOtpBtn.classList.remove(
                    "failed"
                );


                verifyOtpBtn.classList.add(
                    "verified"
                );


                otpStatus.innerText =
                    "OTP verified successfully ✓";


                // Show password section
                passwordSection.style.display =
                    "block";


                // Hide resend
                resendOtpBtn.style.display =
                    "none";

            }

            else {

                otpVerified = false;


                verifyOtpBtn.innerText =
                    "Verify";


                verifyOtpBtn.classList.remove(
                    "verified"
                );


                verifyOtpBtn.classList.add(
                    "failed"
                );


                otpStatus.innerText =
                    data.message;


                // Allow resend
                resendOtpBtn.style.display =
                    "block";

            }

        }

        catch (error) {

            console.error(
                "Verify OTP error:",
                error
            );


            alert(
                "Unable to connect to the server."
            );


            verifyOtpBtn.innerText =
                "Verify";

        }


        verifyOtpBtn.disabled = false;

    }
);


// ------------------------------------
// RESET PASSWORD
// ------------------------------------

forgotForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // OTP must be verified
        if (!otpVerified) {

            alert(
                "Please verify your OTP first."
            );

            return;

        }


        const email =
            emailInput.value.trim();

        const otp =
            otpInput.value.trim();

        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        // Password length
        if (password.length < 4) {

            alert(
                "Password must be at least 4 characters."
            );

            return;

        }


        // Password match
        if (password !== confirmPassword) {

            alert(
                "Passwords do not match."
            );

            return;

        }


        resetPasswordBtn.disabled = true;

        resetPasswordBtn.innerText =
            "Resetting...";


        try {

            const response = await fetch(
                "http://127.0.0.1:8000/forgot-password/reset",
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        email: email,

                        otp: otp,

                        password: password

                    })

                }
            );


            const data =
                await response.json();


            if (data.success) {

                alert(
                    "Password reset successful!"
                );


                // Go to login
                window.location.href =
                    "4login.html";

            }

            else {

                alert(data.message);

            }

        }

        catch (error) {

            console.error(
                "Reset password error:",
                error
            );


            alert(
                "Unable to connect to the server."
            );

        }


        resetPasswordBtn.disabled = false;

        resetPasswordBtn.innerText =
            "Reset Password";

    }
);


// ------------------------------------
// PASSWORD SHOW / HIDE
// ------------------------------------

const toggleButtons =
    document.querySelectorAll(
        ".toggle-password"
    );


toggleButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const target =
                    this.getAttribute(
                        "data-target"
                    );


                const input =
                    document.getElementById(
                        target
                    );


                if (input.type === "password") {

                    input.type = "text";

                    this.innerHTML = "🙈";

                }

                else {

                    input.type = "password";

                    this.innerHTML = "👁";

                }

            }
        );

    }
);