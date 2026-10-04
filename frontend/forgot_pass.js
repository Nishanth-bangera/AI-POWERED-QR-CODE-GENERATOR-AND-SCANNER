// OTP Variables

let generatedOTP = null;
let otpVerified = false;


// Elements

const sendOtpBtn = document.getElementById("send-otp-btn");
const resendOtpBtn = document.getElementById("resend-otp-btn");
const verifyOtpBtn = document.getElementById("verify-otp-btn");

const otpContainer = document.getElementById("otp-container");
const otpInput = document.getElementById("otp");

const passwordSection = document.getElementById("password-section");

const forgotForm = document.getElementById("forgotForm");



// Generate OTP

function generateOTP(){

    generatedOTP = Math.floor(100000 + Math.random() * 900000);

    console.log("Your OTP is:", generatedOTP);

}



// Send OTP

sendOtpBtn.addEventListener("click",function(){


    let email = document.getElementById("email").value.trim();


    if(email === ""){

        alert("Please enter your email address");

        return;

    }



    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if(!emailPattern.test(email)){

        alert("Please enter a valid email address");

        return;

    }



    generateOTP();


    otpContainer.style.display="block";


    sendOtpBtn.innerHTML="OTP Sent";


    sendOtpBtn.disabled=true;


    alert("OTP sent successfully");


});




// Verify OTP


verifyOtpBtn.addEventListener("click",function(){


    let enteredOTP = otpInput.value;



    if(enteredOTP == generatedOTP){


        otpVerified=true;


        verifyOtpBtn.innerHTML="Verified ✓";


        verifyOtpBtn.classList.remove("failed");


        verifyOtpBtn.classList.add("verified");



        passwordSection.style.display="block";


        resendOtpBtn.style.display="none";


    }


    else{


        otpVerified=false;


        verifyOtpBtn.innerHTML="Invalid OTP";


        verifyOtpBtn.classList.remove("verified");


        verifyOtpBtn.classList.add("failed");


        resendOtpBtn.style.display="block";


    }



});





// Resend OTP


resendOtpBtn.addEventListener("click",function(){


    generateOTP();


    otpInput.value="";


    verifyOtpBtn.innerHTML="Verify";


    verifyOtpBtn.classList.remove("failed");

    verifyOtpBtn.classList.remove("verified");



    otpVerified=false;


    passwordSection.style.display="none";


    alert("New OTP sent successfully");


});





// Reset Password


forgotForm.addEventListener("submit",function(e){


    e.preventDefault();



    if(!otpVerified){


        alert("Please complete email verification");


        return;


    }



    let password=document.getElementById("password").value;


    let confirmPassword=document.getElementById("confirm-password").value;




    if(password===""){


        alert("Enter new password");


        return;


    }




    if(password !== confirmPassword){


        alert("Passwords do not match");


        return;


    }




    alert("Password reset successful");


    window.location.href="4login.html";



});





// Password show/hide


const toggleButtons=document.querySelectorAll(".toggle-password");


toggleButtons.forEach(button=>{


    button.addEventListener("click",function(){


        let target=this.getAttribute("data-target");


        let input=document.getElementById(target);



        if(input.type==="password"){


            input.type="text";


            this.innerHTML="🙈";


        }

        else{


            input.type="password";


            this.innerHTML="👁";


        }


    });


});