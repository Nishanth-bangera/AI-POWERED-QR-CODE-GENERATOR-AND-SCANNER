window.onload = function(){
    google.accounts.id.initialize({
        client_id: "685656404688-p282km0f726pucag2knlmjdg7pg84g5g.apps.googleusercontent.com",
        callback: handleGoogleLogin
    });
    google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        {
           theme:"outline",
            size:"large",
            width:300
        }
    );
};
function handleGoogleLogin(response){
    console.log("Google Login Successful");
    // Google user token
    console.log(response.credential);
    // Open home page
    window.location.href="home.html";
}