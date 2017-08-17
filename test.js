var url = "https://toggl.com/reports/api/v2/details?user_agent=fa_vince@hotmail.com&workspace_id=2204314&since=2017-08-01&until=2017-08-17&page=";
tableau.log(url);

for(q = 1; q <= len; q++){
	async_request.push(
	$.ajax({
		type: 'GET',
		url: url + q,
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', 'Basic ' + btoa('d323f7bda7be76cc85b7836db3eaafab:api_token'));
		},
		success: function (resp) {
			var tasks = resp.data; 
			for (var i = 0, len = tasks.length; i < len; i++){
				desc = tasks[i].description;
				start = tasks[i].start.substring(0,10) + " " + tasks[i].start.substring(11,18);
				end = tasks[i].end.substring(0,10) + " " + tasks[i].end.substring(11,18);
				proj = tasks[i].project;
				task = tasks[i].task;
				client = tasks[i].client;
				bill = tasks[i].billable;
				isbill = tasks[i].is_billable;
				
				tableData.push({
					"desc" : desc,
					"start" : start,
					"end" : end,
					"proj" : proj,
					"tasl" : task,
					"client" : client,
					"bill" : bill,
					"isbill" : isbill
				});
			}
		}
	})
	);
}