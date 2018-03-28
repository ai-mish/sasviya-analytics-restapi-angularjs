var version 		= 0.2,
	http 			= 'https://'
	server 			= 'viya47.appsalops.sashq-d.openstack.sas.com',
	port 			= ':8777',
	grant_type 		= 'password',
	username 		= 'sasdemo07',
	password 		= 'demopw',
	client_id 		= 'snzrle_api',
	client_secret 	= 'Orion123',
	token 			= sessionStorage.getItem('token'),
	session 		= sessionStorage.getItem('session'),
	status 			= false;

var cas = {
	login:function(){
		if(!token){
			$.ajax({
				url: http+server+'/SASLogon/oauth/token',
				type:'POST',
				async: false,
				timeout:15000,
				data:'grant_type='+grant_type+'&username='+username+'&password='+password+'&client_id='+client_id+'&client_secret='+client_secret,
				beforeSend:function(xhr) {
					xhr.setRequestHeader('Accept', 'application/json'),
					xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				},
				success:function(api) {
					token = api.access_token;
					console.log('Token:',token);
				},
				error:function(jqXHR, textStatus, errorThrown) {
					if (textStatus ==="timeout") {
						console.log('api timed out!');
					}
				}
			});
		}
	},
	createSession:function(){
		if(!session){
			$('#loadingmessage').show();
			$.ajax({
				url: http+server+port+'/cas/sessions/',
				type:'POST',
				async: false,
				timeout:15000,
				data:'',
				beforeSend:function(xhr) {
					xhr.setRequestHeader('Authorization', 'bearer '+token);
					xhr.setRequestHeader('Content-Type', 'application/json');
				},
				success:function(api) {
					session = api.session;
					status = true;
					console.log('Session:',session,'Status:',status);
				},
				error:function(jqXHR, textStatus, errorThrown) {
					if (textStatus ==="timeout") {
						console.log('api timed out!');
					}
				},
				complete:function(){
					$('#loadingmessage').hide();
				}
			});
		}
	},
	dropSession:function(){
		$.ajax({
			url: http+server+port+'/cas/sessions/'+session+'/terminate',
			type:'POST',
			async: true,
			timeout:15000,
			data:'',
			beforeSend:function(xhr) {
				xhr.setRequestHeader('Authorization', 'bearer '+token);
				xhr.setRequestHeader('Content-Type', 'application/json');
			},
			success:function(api) {
				session = '';
				status = false;
				console.log('Session:',session,'Status:',status);
			},
			error:function(jqXHR, textStatus, errorThrown) {
				if (textStatus ==="timeout") {
					console.log('api timed out!');
				}
			}
		});
	},
	act:function(action,param){
		$.ajax({
			url: http+server+port+'/cas/sessions/'+session+'/actions/'+action,
			type:'POST',
			async: false,
			timeout:15000,
			data:param,
			beforeSend:function(xhr) {
				xhr.setRequestHeader('Authorization', 'bearer '+token);
				xhr.setRequestHeader('Content-Type', 'application/json');
			},
			success:function(api) {
				console.log(api);
			},
			error:function(jqXHR, textStatus, errorThrown) {
				if (textStatus ==="timeout") {
					console.log('api timed out!');
				}
			}
		});
	},
	upload:function(action,param,myData){
		$.ajax({
			url: http+server+port+'/cas/sessions/'+session+'/actions/'+action,
			type:'PUT',
			async: false,
			timeout:15000,
			data:myData,
			beforeSend:function(xhr) {
				xhr.setRequestHeader('JSON-Parameters', param);
				xhr.setRequestHeader('Authorization', 'bearer '+token);
				xhr.setRequestHeader('Content-Type', 'binary/octet-stream');
			},
			success:function(api) {
				console.log(action,api);
			},
			error:function(jqXHR, textStatus, errorThrown) {
				if (textStatus ==="timeout") {
					console.log('api timed out!');
				}
			}
		});
	},
	fetch:function(action,param){
		$.ajax({
			url:  http+server+port+'/cas/sessions/'+session+'/actions/'+action,
			type:'POST',
			async: false,
			timeout:15000,
			data:param,
			beforeSend:function(xhr) {
				xhr.setRequestHeader('Authorization', 'bearer '+token);
				xhr.setRequestHeader('Content-Type', 'application/json');
			},
			success:function(api) {
				var x = api.results;
				var y = x[Object.keys(x)[0]].rows[0][6];
				var imageURL;
				var message;
				var messageColor;
				var extraMessage="";
				console.log(api);
				if( y < 0.5) {
					imageURL = "/hmeq/tick.gif";
					message = "Approved!";
					messageColor = "green";
					extraMessage = "If you would like to try again, please refresh the app.";
				} else {
					imageURL = "/hmeq/x.gif";
					message = "Declined!";
					messageColor = "red";
					extraMessage = "Please call us on 1800-SAS-API. We are determined to help you get a loan! If you would like to try again, please refresh the app.";
				}
				document.getElementById("image").src = imageURL;
				document.getElementById("resultMsg").innerHTML = message;
				document.getElementById("resultMsg").style.color = messageColor;
				document.getElementById("resultDetails").innerHTML = extraMessage;
				document.getElementById("btn").innerHTML = "Calculate";
				document.getElementById("loading").style.display = "None";
				$('#modalPush').modal();
			},
			error:function(jqXHR, textStatus, errorThrown) {
				if (textStatus ==="timeout") {
					console.log('api timed out!');
				}
			}
		});
	}
}

var proc = {
	model:function(data){
		cas.login();
		cas.createSession();
		cas.upload('upload','{"casOut":{"caslib":"TEMP","name":"INPUTDATA","replace":true},"importOptions":{"fileType":"csv"}}',data);
		cas.act('loadactionset','{"actionSet":"modelPublishing"}');
		cas.act('modelPublishing.runModelLocal','{"inTable":{"caslib": "TEMP","name": "INPUTDATA"},"modelName": "R_LogisticRegression","modelTable":{"caslib": "PUBLIC","name": "MM_MODEL_TABLE"},"outTable":{"caslib": "TEMP","name": "SCORED_NEW","replace": true}}');
		cas.fetch('fetch','{"table":{"caslib":"TEMP","name":"SCORED_NEW"}}');
		cas.dropSession();
	},
	status:function(msg){
		document.getElementById('status').innerHTML = msg;
	}
}

function submitInput() {
	document.getElementById("btn").innerHTML = "Calculating, please wait...";
	var mortdueValue = $('#homeInput').val() - $('#depositInput').val();
	var debtInc = mortdueValue /  $('#earningsInput').val();
	var YOJ = $('#jobInput').val();
	var value = $('#homeInput').val();
	var dataString = "MORTDUE,DEBTINC,VALUE,YOJ,LOAN\r\n" + mortdueValue + "," + debtInc + "," + value + "," + YOJ + "," + mortdueValue +'\r\n';
	show_image("/hmeq/loading.gif");
	setTimeout(function() {
		proc.model(dataString);
	}, 1000);
}

function show_image(src) {
	var img = document.getElementById("loading");
	img.src = src;
}
