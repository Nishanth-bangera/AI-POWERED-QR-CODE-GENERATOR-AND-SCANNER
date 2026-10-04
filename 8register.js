


// ------------------------------------
// SHOW ERROR / STATUS
// ------------------------------------

function showMessage(message, color = "red") {

    const error = document.getElementById("error");

    error.innerText = message;
    error.style.color = color;
}


// ------------------------------------
// CONVERT MOBILE NUMBER
// ------------------------------------

function getMobileNumber() {

    let mobile = document.getElementById("mobile").value.trim();

    // Remove spaces, +, -, brackets, etc.
    mobile = mobile.replace(/\D/g, "");

    // If user entered 9876543210
    if (mobile.length === 10) {
        return mobile;
    }

    // If user entered 919876543210
    if (mobile.length === 12 && mobile.startsWith("91")) {
        return mobile.slice(2);
    }

    return null;
}


// ------------------------------------
// SEND OTP
// ------------------------------------

document.getElementById("send-otp-btn").addEventListener("click", function () {

    const mobile = getMobileNumber();

    if (!mobile) {

        showMessage(
            "Please enter a valid 10-digit Indian mobile number."
        );

        return;
    }


    if (typeof window.sendOtp !== "function") {

        console.error("MSG91 sendOtp() is not available.");

        showMessage(
            "MSG91 OTP service is not loaded. Please refresh the page."
        );

        return;
    }


    const sendButton = document.getElementById("send-otp-btn");

    sendButton.disabled = true;
    sendButton.innerText = "Sending...";


    console.log("Sending OTP to:", mobile);


    window.sendOtp(

        mobile,

        function (data) {

            console.log("OTP sent successfully:", data);

            document.getElementById("otp-section").style.display = "block";

            document.getElementById("otp-status").innerText =
                "OTP sent to your mobile number.";

            document.getElementById("otp-status").style.color = "green";

            sendButton.disabled = false;
            sendButton.innerText = "Resend OTP";
        },

        function (error) {

            console.error("OTP send failed:", error);

            showMessage(
                "Unable to send OTP. Please check your mobile number."
            );

            sendButton.disabled = false;
            sendButton.innerText = "Send OTP";
        }
    );
});


// ------------------------------------
// VERIFY OTP
// ------------------------------------

document.getElementById("verify-otp-btn").addEventListener("click", function () {

    const otp = document.getElementById("otp").value.trim();

    if (!otp) {

        showMessage("Please enter the OTP.");

        return;
    }


    if (!/^\d{4,6}$/.test(otp)) {

        showMessage("Please enter a valid OTP.");

        return;
    }


    if (typeof window.verifyOtp !== "function") {

        console.error("MSG91 verifyOtp() is not available.");

        showMessage(
            "MSG91 verification service is not loaded."
        );

        return;
    }


    const verifyButton = document.getElementById("verify-otp-btn");

    verifyButton.disabled = true;
    verifyButton.innerText = "Verifying...";


    window.verifyOtp(

        otp,

        function (data) {

            console.log("OTP verified successfully:", data);

            mobileVerified = true;

            document.getElementById("otp-status").innerText =
                "Mobile number verified ✓";

            document.getElementById("otp-status").style.color = "green";

            verifyButton.innerText = "Verified ✓";

            verifyButton.disabled = true;

            document.getElementById("send-otp-btn").disabled = true;

            showMessage(
                "Mobile number verified successfully.",
                "green"
            );
        },

        function (error) {

            console.error("OTP verification failed:", error);

            mobileVerified = false;

            showMessage(
                "Incorrect OTP. Please try again."
            );

            verifyButton.disabled = false;
            verifyButton.innerText = "Verify OTP";
        }
    );
});


// ------------------------------------
// REGISTER USER
// ------------------------------------

document.getElementById("registerForm").addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const name =
            document.getElementById("fullname").value.trim();

        const mobile =
            document.getElementById("mobile").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirm-password").value;


        // Check fields

        if (
            name === "" ||
            mobile === "" ||
            email === "" ||
            password === "" ||
            confirmPassword === ""
        ) {

            showMessage("Please fill all fields.");

            return;
        }


        // Check password

        if (password !== confirmPassword) {

            showMessage("Password does not match.");

            return;
        }


        // IMPORTANT:
        // Mobile must be verified before registration

        if (!mobileVerified) {

            showMessage(
                "Please verify your mobile number with OTP first."
            );

            return;
        }


        try {

            const response = await fetch(
                "http://127.0.0.1:8000/register",
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        name: name,
                        mobile: mobile,
                        email: email,
                        password: password

                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                showMessage(
                    data.detail || "Registration failed."
                );

                return;
            }


            if (data.message === "Registration successful") {

                window.location.href = "home.html";

            } else {

                showMessage(
                    data.message || "Registration failed."
                );
            }


        } catch (error) {

            console.error("Registration error:", error);

            showMessage(
                "Unable to connect to the server."
            );
        }

    }
);
