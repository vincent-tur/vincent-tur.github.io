var url = "https://toggl.com/reports/api/v2/details?user_agent=fa_vince@hotmail.com&workspace_id=2204314&since=2017-08-01&until=2017-08-17&page=1";

	$.ajax({
		type: 'GET',
		url: url,
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', 'Basic ' + btoa('d323f7bda7be76cc85b7836db3eaafab:api_token'));
		},
		success: function (resp) {
			var tasks = resp.data; 
			for (var i = 0, len = tasks.length; i < len; i++){
				console.log(tasks[i]);
			}
		}
	});
