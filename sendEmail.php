<?php
if(isset($_POST["submit"])){
	
	//Get form data in variables
	$name = $_POST['name'];
	$email = $_POST['email'];
	$subject = $_POST['subject'];
	$message = $_POST['message'];
 
	//Use PHPmailer
	require "phpmailer/PHPMailerAutoload.php";
	$mail = new PHPMailer;
 
	//Mailbody to send in email
	$mailbody = "The details submitted on contact form are:-<br><br><b>Name:</b> ".$name . "<br> <b>Email:</b> ".$email . "<br> <b>Subject:</b> " . $_POST['subject'] . "<br> <b>Message:</b> " . $_POST['message'];
 
	//Sender email address
	$sender = "mbrown9702@gmail.com"; 	  // Gmail SMTP username
	$mail->isSMTP();                  // Set mailer to use SMTP
	$mail->Host = 'smtp.gmail.com';   // Specify main and backup SMTP servers
	$mail->SMTPAuth = true;           // Enable SMTP authentication
	$mail->Username = $sender;        // SMTP username
	$mail->Password = 'Copjobs231!';// Gmail SMTP password
	$mail->SMTPSecure = 'tls';        // Enable TLS encryption, `ssl` also accepted
	$mail->Port = 587;                // TCP port to connect to	 
 
	$mail->setFrom($sender, 'Melanie Brown'); 
	
	$mail->addAddress('recipient@example.com', 'Sendername');     // Add a recipient
	//$mail->addAddress('ellen@example.com'); //add more recipient (optional)
	//$mail->addReplyTo('reply@example.com', 'replytoname');
	//$mail->addCC('cc@example.com');
	//$mail->addBCC('bcc@example.com');
 
	$mail->isHTML(true);    // Set email format to HTML
	$mail->Subject = 'Contact Form '.'"'.$subject.'"';
	$mail->Body = $mailbody;
	//$mail->AltBody = 'This is the body in plain text for non-HTML mail clients';
 
	//Email your contact form data using Gmail SMTP with PHPMailer
	if(!$mail->send()){
		echo 'Message could not be sent.';
		echo 'Mailer Error: ' . $mail->ErrorInfo;
	}else{
		echo 'Message has been sent successfully';
	}
}
?>