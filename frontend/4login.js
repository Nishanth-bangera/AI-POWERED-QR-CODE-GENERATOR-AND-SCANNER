document.addEventListener("DOMContentLoaded", function () {

    const signInBtn = document.getElementById("signInBtn");

    signInBtn.addEventListener("click", async function () {

        const identifier = document.getElementById("identifier").value.trim();
        const password = document.getElementById("password").value;

        // Check empty fields
        if (identifier === "" || password === "") {
            alert("Please enter your email/mobile number and password.");
            return;
        }

        // Disable button while checking
        signInBtn.disabled = true;
        signInBtn.innerText = "Signing In...";

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        identifier: identifier,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (data.success) {

                console.log("Login successful");

                // Open home page
                window.location.href = "home.html";

            } else {

                alert(data.message);

                signInBtn.disabled = false;
                signInBtn.innerText = "Sign In";
            }

        } catch (error) {

            console.error("Login error:", error);

            alert(
                "Unable to connect to the server. Please start the backend."
            );

            signInBtn.disabled = false;
            signInBtn.innerText = "Sign In";
        }

    });

});