var email = '';
var workspace = '';
var startt = '';
var endt = '';
var token = '';

Date.prototype.toDateInputValue = (function() {
	var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

function get_pages(pagesCallback){
	var url = "https://toggl.com/reports/api/v2/details?user_agent="+email+"&workspace_id="+workspace+"&since="+startt+"&until="+endt;
	
	$.ajax({
		type: 'GET',
		url: url,
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', 'Basic ' + btoa(token + ':api_token'));
		},
		success: pagesCallback
	});
}

function pagesCallback(data){
	num = data["total_count"];
	pages = String(Math.ceil(num/50));
	
	tableau.connectionData = JSON.stringify([pages, email, workspace, token, startt, endt, check]);
	
	tableau.connectionName = "Toggl";
	tableau.submit();
}

(function () {
    var myConnector = tableau.makeConnector();
	
	myConnector.getSchema = function (schemaCallback) {
		
		var cols = [
			{ id : "desc", alias : "Description", dataType : tableau.dataTypeEnum.string },
			{ id : "tp_id", alias : "TargetProcess ID", dataType : tableau.dataTypeEnum.string },
			{ id : "start", alias : "Start Date", dataType : tableau.dataTypeEnum.datetime },
			{ id : "end", alias : "End Date", dataType : tableau.dataTypeEnum.datetime },
			{ id : "proj", alias : "Project", dataType : tableau.dataTypeEnum.string },
			{ id : "task", alias : "Task", dataType : tableau.dataTypeEnum.string },
			{ id : "tag", alias : "Tag", dataType : tableau.dataTypeEnum.string },
			// { id : "first_encounter", alias : "First Encounter", dataType : tableau.dataTypeEnum.boolean },
			{ id : "dur", alias : "Duration", dataType : tableau.dataTypeEnum.float },
			// { id : "studytype", alias : "Study Type", dataType : tableau.dataTypeEnum.string }
		];
		
		var tableInfo = {
			id : "toggl",
			alias : "Toggl Detailed Report",
			columns : cols
		};
		
		schemaCallback([tableInfo]);
	};
	
	myConnector.getData = function (table, doneCallback) {
		var tableData = [];
		var async_request = [];
		var cd = JSON.parse(tableau.connectionData);
		var len = parseInt(cd[0]);
		var email = cd[1];
		var workspace = cd[2];
		var token = cd[3];
		var startt = cd[4];
		if(cd[6] == "checked"){ 
			var endt = new Date().toDateInputValue(); 
		} else { 
			var endt = cd[5]; 
		} 
		var url = "https://toggl.com/reports/api/v2/details?user_agent="+email+"&workspace_id="+workspace+"&since="+startt+"&until="+endt+"&page=";
		tableau.log(url);
		
		for(q = 1; q <= len; q++){
			async_request.push(
			$.ajax({
				type: 'GET',
				url: url + q,
				dataType: 'json',
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Basic ' + btoa(token + ':api_token'));
				},
				success: function (resp) {
					var tasks = resp.data; 
					for (var i = 0, len = tasks.length; i < len; i++){
						desc = tasks[i].description;
						start = tasks[i].start.substring(0,10) + " " + tasks[i].start.substring(11,18);
						end = tasks[i].end.substring(0,10) + " " + tasks[i].end.substring(11,18);
						proj = tasks[i].project;
						task = tasks[i].task;
						dur = ((tasks[i].dur / 1000) / 60).toFixed(1);
						tags = tasks[i].tags;
						// client = tasks[i].client;
						first_encounter = null;

						tp_id = tasks[i].description.match(/#(\d+)/);
						if(tp_id != null){
							if(tp_id.length > 1){
								tp_id = tp_id[1];
							}
							
						}
						

						var rowObj = {
							"desc" : desc,
							"tp_id" : tp_id,
							"start" : start,
							"end" : end,
							"proj" : proj,
							"tasl" : task,
							"tag" : tags,
							// "first_encounter" : first_encounter,
							"dur" : dur,
						};

						
						if(tags !== undefined && tags !== null && Array.isArray(tags) && tags.length > 0){
					
							for(b = 0; b < tags.length; b++){
								// if(restrictedTags.includes(tags[b])){
								// 	continue;
								// }

								
								// if(tags[b] == null || tags[b] == undefined){
								// 	continue;
								// }
								// if(tags[b][0] == '!'){
								// 	specialTag = tags[b].split(":");

								// 	if(specialTag[0] == '!Column'){
								// 		// if(sp)
								// 	}
								// }
								tableData.push({
									"desc" : desc,
									"tp_id" : tp_id,
									"start" : start,
									"end" : end,
									"proj" : proj,
									"tasl" : task,
									// "client" : client,
									"tag" : tags[b],
									"dur" : dur,
									// "studytype" : studytype,
								});
							}
						}else{
							tableData.push(rowObj);
						}

						
					}
				}
			})
			);
		}
		
		$.when.apply(null, async_request).done( function(){
			table.appendRows(tableData);
			doneCallback();
		});
		
	};
	
    tableau.registerConnector(myConnector);
	
	$(document).ready(function () {
		inputdate = new Date();
		$('#enddate').val(inputdate.toDateInputValue());
		inputdate.setDate(inputdate.getDate() - 30);
		$("#startdate").val( inputdate.toDateInputValue() );
		
		$("#today").change(function() { 
			if(this.checked) { 
				$("#enddate").prop('disabled', true); 
			} else { 
				$("#enddate").prop('disabled', false); 
			} 
		}); 
		
		$("#submitb").click(function () {
			email = $('#email').val().trim();
			workspace = $('#workspace').val().trim();
			token = $('#token').val().trim();
			startt = $('#startdate').val();
			if($("#today").attr('checked') ){ 
				endt = new Date().toDateInputValue(); 
			} else { 
				endt = $('#enddate').val(); 
			} 
			check = $('#today').attr('checked'); 
			get_pages(pagesCallback);
		});
	});
	
})();