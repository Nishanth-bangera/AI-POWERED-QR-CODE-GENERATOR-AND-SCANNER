// ------------------------------------
// EMAIL VERIFIED STATUS
// ------------------------------------

let emailVerified = false;


// ------------------------------------
// SHOW ERROR / STATUS
// ------------------------------------

function showMessage(message, color = "red") {

    const error = document.getElementById("error");

    error.innerText = message;
    error.style.color = color;
}


// ------------------------------------
// SEND EMAIL OTP
// ------------------------------------

document.getElementById("send-otp-btn").addEventListener("click", async function () {

    const email =
        document.getElementById("email").value.trim();

    // Check email
    if (!email) {

        showMessage("Please enter your email address.");

        return;
    }


    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        showMessage("Please enter a valid email address.");

        return;
    }


    const sendButton =
        document.getElementById("send-otp-btn");


    // Prevent multiple clicks
    sendButton.disabled = true;
    sendButton.innerText = "Sending...";


    console.log("Sending email OTP to:", email);


    try {

        const response = await fetch(
            "http://127.0.0.1:8000/send-email-otp",
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


        if (!response.ok || !data.success) {

            console.error("Email OTP failed:", data);

            showMessage(
                data.message || "Unable to send OTP."
            );

            sendButton.disabled = false;
            sendButton.innerText = "Send OTP";

            return;
        }


        console.log("Email OTP sent successfully:", data);


        // Show OTP section
        document.getElementById("otp-section").style.display = "block";


        document.getElementById("otp-status").innerText =
            "OTP sent to your email.";

        document.getElementById("otp-status").style.color =
            "green";


        sendButton.disabled = false;
        sendButton.innerText = "Resend OTP";


    } catch (error) {

        console.error("Email OTP connection error:", error);

        showMessage(
            "Unable to connect to the server."
        );

        sendButton.disabled = false;
        sendButton.innerText = "Send OTP";
    }

});


// ------------------------------------
// VERIFY EMAIL OTP
// ------------------------------------

document.getElementById("verify-otp-btn").addEventListener("click", async function () {

    const email =
        document.getElementById("email").value.trim();

    const otp =
        document.getElementById("otp").value.trim();


    // Check OTP
    if (!otp) {

        showMessage("Please enter the OTP.");

        return;
    }


    // OTP must be 6 digits
    if (!/^\d{6}$/.test(otp)) {

        showMessage("Please enter the 6-digit OTP.");

        return;
    }


    const verifyButton =
        document.getElementById("verify-otp-btn");


    verifyButton.disabled = true;
    verifyButton.innerText = "Verifying...";


    console.log("Verifying email OTP for:", email);


    try {

        const response = await fetch(
            "http://127.0.0.1:8000/verify-email-otp",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    otp: otp
                })
            }
        );


        const data = await response.json();


        if (!response.ok || !data.success) {

            console.error("OTP verification failed:", data);

            emailVerified = false;

            showMessage(
                data.message || "Incorrect OTP."
            );

            verifyButton.disabled = false;
            verifyButton.innerText = "Verify OTP";

            return;
        }


        // Email verified
        emailVerified = true;


        console.log("Email OTP verified successfully.");


        document.getElementById("otp-status").innerText =
            "Email verified ✓";

        document.getElementById("otp-status").style.color =
            "green";


        verifyButton.innerText =
            "Verified ✓";

        verifyButton.disabled = true;


        document.getElementById("send-otp-btn").disabled =
            true;


        showMessage(
            "Email verified successfully.",
            "green"
        );


    } catch (error) {

        console.error("OTP verification connection error:", error);

        emailVerified = false;

        showMessage(
            "Unable to connect to the server."
        );

        verifyButton.disabled = false;
        verifyButton.innerText = "Verify OTP";
    }

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


        // ------------------------------------
        // CHECK FIELDS
        // ------------------------------------

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


        // ------------------------------------
        // CHECK PASSWORD
        // ------------------------------------
        if (password.length < 4) {
    showMessage("Password must be at least 4 characters");
    return;
}

        if (password !== confirmPassword) {

            showMessage("Password does not match.");

            return;
        }


        // ------------------------------------
        // EMAIL MUST BE VERIFIED
        // ------------------------------------

        if (!emailVerified) {

            showMessage(
                "Please verify your email with OTP first."
            );

            return;
        }


        // ------------------------------------
        // REGISTER
        // ------------------------------------

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