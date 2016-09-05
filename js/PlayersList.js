/*
	TO DO
	
	Validation messages
	Table editing
	

	display info in the console.log for saving player info
		
		Issues with firefox displaying the images
		
	productionising requires:
		refactoring filter code
		creating components
		
		images not uploaded as would use a drag and drop feature
		
		
*/

CLICKTOOLS.PlayersList=function(data) {

	var self=this;
	
	var CONSTANTS={
		OFFSET:'{{OFFSET}}',
		LIMIT:10,
		URLS:{
			GET:'http://qa.badgeville.com/cairo/v1/877f63d3590e6ac4bf3e540ab2f02afc/sites/54ffa4b35979db3ea400009d/players?offset={{OFFSET}}&callback=?',
			SAVE:'http://qa.badgeville.com/cairo/v1/877f63d3590e6ac4bf3e540ab2f02afc/sites/54ffa4b35979db3ea400009d/players/{{ID}}?fields=all&includes=teams,rewards:currentlevels&data={name:\'{{NAME}}\',display_name:\'{{DISPLAY_NAME}}\'}&do=update&callback=?'

		}

	};

	/* Images data player */
	this.Player=function(data) {
	
		data.display_name=ko.observable(data.display_name);
		data.units.points.all=ko.observable(data.units.points.all);
		data.units.points.year=ko.observable(data.units.points.year);
		data.units.points.month=ko.observable(data.units.points.month);
		data.units.points.week=ko.observable(data.units.points.week);
		data.units.points.day=ko.observable(data.units.points.day);
		data.show=ko.observable(true);

		return data;
		
	};

	this.setEditablePlayer=function(data) {

		if (typeof data=='undefined') {
			self.editablePlayer={
				id:'',
				display_name:ko.observable(''),
				image:ko.observable(''),
				units:{
					points:{
						display_name:ko.observable(''),
						all:ko.observable(0),
						year:ko.observable(0),
						month:ko.observable(0),
						week:ko.observable(0),
						day:ko.observable(0)
					}
				}
			};
			
			self.editablePlayer.display_name
				.extend( 
					{
						required:{
							message:'The player name is a required value', 
							params:true
						},
						maxLength:{
							message:'The player name has a maximum length of 255', 
							params:255
						}
					}
				);
				
			self.editablePlayer.units.points.all
				.extend(
					{
						required:{
							message:'All player points is a required numeric value', 
							params:true
						},
						min:{
							message:'All player points must be a positive value', 
							params:0
						}
					}
				)
				.extend({mustBeGreaterThanEqualOrEqualTo:self.editablePlayer.units.points.year});
			
			self.editablePlayer.units.points.year
				.extend(
					{
						required:{
							message:'Year player points is a required numeric value', 
							params:true
						},
						min:{
							message:'Year player points must be a positive value', 
							params:0
						}
					}
				)
				.extend({mustBeGreaterThanEqualOrEqualTo:self.editablePlayer.units.points.month});
				
			self.editablePlayer.units.points.month
				.extend(
					{
						required:{
							message:'Month player points is a required numeric value', 
							params:true
						},
						min:{
							message:'Month player points must be a positive value', 
							params:0
						}
					}
				)
				.extend({mustBeGreaterThanEqualOrEqualTo:self.editablePlayer.units.points.week});

			self.editablePlayer.units.points.week
				.extend(
					{
						required:{
							message:'Week player points is a required numeric value', 
							params:true
						},
						min:{
							message:'Week player points must be a positive value', 
							params:0
						}
					}
				)
				.extend({mustBeGreaterThanEqualOrEqualTo:self.editablePlayer.units.points.day});

			self.editablePlayer.units.points.day
				.extend(
					{
						required:{
							message:'Day player points is a required numeric value', 
							params:true
						},
						min:{
							message:'Day player points must be a positive value', 
							params:0
						}
					}
				);
		}
		else {
			self.editablePlayer.id=data.id;
			self.editablePlayer.display_name(data.display_name());
			self.editablePlayer.image(data.image);
			self.editablePlayer.units.points.display_name(data.units.points.display_name);
			self.editablePlayer.units.points.all(data.units.points.all());
			self.editablePlayer.units.points.year(data.units.points.year());
			self.editablePlayer.units.points.month(data.units.points.month());
			self.editablePlayer.units.points.week(data.units.points.week());
			self.editablePlayer.units.points.day(data.units.points.day());
		}

		return this;
		
	};
	
	this.players=ko.observableArray([]);
	
	this.activePlayerIndex=ko.observable(0);
	this.loading=ko.observable(false);	
	this.saving=ko.observable(false);	
	this.isDataAvailable=ko.observable(true);
	this.isViewModalVisible=ko.observable(false);	
	this.isEditModalVisible=ko.observable(false);
	this.offset=ko.observable(0);
	this.limit=ko.observable(0);
	
	this.editablePlayer={};
	this.setEditablePlayer();

	this.registerCustomValidationRules=function() {
		
		ko.validation.rules['mustBeGreaterThanEqualOrEqualTo'] = {
			validator: function (val, otherVal) {
				return val >= ko.unwrap(otherVal);
			},
			message: 'The field must be greater than or equal to {0}'
		};
		ko.validation.registerExtenders();
		
	};
	
	/* Loads players */
	this.get=function(message) {

		self.loading(true);

		$.getJSON(
			CONSTANTS.URLS.GET.replace(CONSTANTS.OFFSET,self.offset()),
			function(response){

				var players=response.players;
				
				for (var i=0, ii=players.length;i<ii;i++) {
					self.players.push(new self.Player(players[i]));
				}			
				
				self.limit(response._context_info.limit);

				if (players.length < CONSTANTS.LIMIT) {
					self.isDataAvailable(false);	
				}

				var newoffset=self.offset()+CONSTANTS.LIMIT;
				self.offset(newoffset);
				self.loading(false);

				message=message || CLICKTOOLS.logger.MESSAGES.INITIALLOAD;
				CLICKTOOLS.logger.logAction(message.replace('{{PLAYERS}}', players.length));
				
				if (self.filterValue().length) {
					var startIndex=self.players().length - players.length;
					self.filterData(self.filterValue(), startIndex);
				}
					
				self.sort.sort();
			}
		);

	};
	
	/* Save player */
	this.save=function() {

		var player=self.players()[self.activePlayerIndex()];

		self.saving(true);

		$.getJSON(
			CONSTANTS.URLS.SAVE.replace('{{ID}}',self.editablePlayer.id).replace('{{DISPLAY_NAME}}',self.editablePlayer.display_name()).replace('{{NAME}}',self.editablePlayer.display_name()),
			function(response){
				player.display_name(self.editablePlayer.display_name());
				player.units.points.all(self.editablePlayer.units.points.all());
				player.units.points.year(self.editablePlayer.units.points.year());
				player.units.points.month(self.editablePlayer.units.points.month());
				player.units.points.week(self.editablePlayer.units.points.week());
				player.units.points.day(self.editablePlayer.units.points.day());
				
				var message=CLICKTOOLS.logger.MESSAGES.SAVE.replace('{{DISPLAY_NAME}}', player.display_name());
				CLICKTOOLS.logger.logAction(message);
				
								
				if (self.filterValue().length) {
					self.filterData(self.filterValue(), self.activePlayerIndex(), self.activePlayerIndex()+1);
				}
				self.sort.sort();
				
				self.saving(false);
				
				$(function () {
				   $('#playerEditModal').modal('toggle');
				});

			}
		);

	};
				
				
	/* Loads players via user click request*/
	this.getViaUserRequest=function() {
		
		self.get(CLICKTOOLS.logger.MESSAGES.CLICKLOAD);
		
	};
	
	/* Display a player modal dialog */
	this.viewPlayer=function(player) {
		
		var index=self.players.indexOf(player);
		self.activePlayerIndex(index);	
		self.isViewModalVisible(true);	
		$('#playerViewModal').modal({show:true});
		
		var message=CLICKTOOLS.logger.MESSAGES.VIEW.replace('{{DISPLAY_NAME}}', player.display_name());
		CLICKTOOLS.logger.logAction(message);
		
	};
		
	/* Display a player modal dialog for editing*/
	this.editPlayer=function(player) {
		
		var index=self.players.indexOf(player);
		self.activePlayerIndex(index);	
		
		self.setEditablePlayer(self.players()[index]);
		self.isEditModalVisible(true);

		$('#playerEditModal').on(
			'shown', 
			function () {
				$('#display_name').focus();
			}
		);
		$('#playerEditModal').modal({show:true, backdrop: 'static', keyboard: false});
		
		var message=CLICKTOOLS.logger.MESSAGES.EDIT.replace('{{DISPLAY_NAME}}', player.display_name());
		CLICKTOOLS.logger.logAction(message);
		
	};
	
	/* Returns the player that was selected for viewing or editing */
	this.getActivePlayer=function() {
		
		return self.players()[self.activePlayerIndex()];
		
	};	

	/* Filtering */
	this.filterValue=ko.observable('').extend({ throttle: 400 });

	this.filterFields=[
		'display_name'
	];
	
	this.filterData=function(newValue, startIndex, endIndex) {
	
		var players=self.players(),
			player,
			key, 
			found,
			count=0,
			filterValue=self.filterValue().toLowerCase();
			
		startIndex=(typeof startIndex!='undefined')?startIndex:0;
		endIndex=(typeof endIndex!='undefined')?endIndex:players.length;
			
		for(i=startIndex, ii=endIndex;i<ii;i++) {

			found=false;
			player=players[i];
	
			if (self.filterItem(player, filterValue) ) {
				found=true;
				count++;
				
			}
	
			player.show(found);
		}
		
		var message=CLICKTOOLS.logger.MESSAGES.FILTER
					.replace('{{FILTER}}', self.filterValue())
					.replace('{{RECORDS}}', count);
		
		CLICKTOOLS.logger.logAction(message);
		
	};
	
	this.filterItem=function(item, filterValue) {
			
		if (filterValue=='') {
			return true;
		}
		else {
			var key;
			
			for(j=0, jj=self.filterFields.length;j<jj;j++) {
		
				key=self.filterFields[j];
				if (item[key]().toString().toLowerCase().indexOf(filterValue)!=-1) {
					return true;
					break;
				};
		
			}
		}
		return false;
	};
	
	this.filterValue.subscribe(
		this.filterData
	);
	
	/* Sorting */
	this.sort=new CLICKTOOLS.Sort(
		{
			keys:[
				{	
					name:'display_name', 
					label:'Name'
				},
				{
					name:'units.points.all',
					label:'Total points'
				}
			],
			defaultSort:{
				key:'display_name', 
				order:'ASCENDING'
			},
			data:function() { 
				return self.players 
			}
		}
	);
	
	
	/* Load more players automatically if the user scrolls to the bottom of the page */
	this.InitialiseScrollLoader=function() {
		
		$(window).scroll(
			function () {
				
				if ($(document).height() - 50 <= $(window).scrollTop() + $(window).height()) {
				
					if (!self.loading() && self.isDataAvailable()) {
						self.get(CLICKTOOLS.logger.MESSAGES.SCROLLLOAD);
					}

				}
			}
		);
		
	};
	
	CLICKTOOLS.logger=CLICKTOOLS.logger || new CLICKTOOLS.Logger();
	
	this.registerCustomValidationRules();
	this.InitialiseScrollLoader();
	this.get();

	return this;
	
};


CLICKTOOLS.Logger=function() {

	var self=this;

	this.MESSAGES={
		VIEW:'Profile viewed for {{DISPLAY_NAME}}',
		EDIT:'Profile edited for {{DISPLAY_NAME}}',
		SAVE:'Profile saved for {{DISPLAY_NAME}}',
		FILTER:'Filter "{{FILTER}}" applied, {{RECORDS}} record(s) found',
		SORT:'Players sorted in {{SORTORDER}} order by {{SORTKEY}}',
		INITIALLOAD:'{{PLAYERS}} players loaded',
		SCROLLLOAD:'{{PLAYERS}} players loaded automatically via scroll',
		CLICKLOAD:'{{PLAYERS}} players loaded via user request'
	};
	
	this.logAction=function(message) {
	
		console.log(message);
		
	};

	return this;

};

CLICKTOOLS.Sort=function(settings) {
	
	var self=this;
	
	if (typeof settings.keys=='undefined') {
		console.log('No CLICKTOOLS.Sort keys specified');
	}
	if (typeof settings.data=='undefined') {
		console.log('No CLICKTOOLS.Sort data specified');
	}
	if (typeof settings.defaultSort=='undefined') {
		console.log('No CLICKTOOLS.Sort defaultSort specified');
	}
	
	var CONSTANTS={
		ASCENDING:'ASCENDING',
		DESCENDING:'DESCENDING'
	};
	
	this.sorting=ko.observable(false);
	this.sortOrder=ko.observable(CONSTANTS.ASCENDING);
	this.sortKey=ko.observable('');
	
	this.defaultSort=settings.defaultSort || {};
	
	this.data=(typeof settings.data!='undefined')?settings.data:function() { return [] }; 
	
	this.keys=ko.observableArray([]);

	this.Key=function(data) {

		var keyA, keyB;
	
		if (typeof data.observable!='undefined' && data.observable==false) {
			keyA='a.'+data.name;
			keyB='b.'+data.name;
		}
		else {
			keyA='ko.unwrap(a.'+data.name+')';
			keyB='ko.unwrap(b.'+data.name+')';
		}

		data.sortAscending=new Function(
			'a', 
			'b', 
			'var a='+keyA+',b='+keyB+';return (a < b)? -1 : ((a > b)? 1 : 0);'
		);
		
		data.sortDescending=new Function(
			'a', 
			'b', 
			'var a='+keyA+',b='+keyB+';return (a < b)? 1 : ((a > b)? -1 : 0);'
		);
	
		data.selectedCSS=ko.pureComputed(
			function() {
				
				return (self.sortKey()===this.name)?'selected':'';
			},
			data
		);
		return data;
	
	};

	this.initialise=function() {
		
		var keys=settings.keys || [];
		
		for (var i=0,ii=keys.length;i<ii;i++) {
			
			self.keys.push(
				new self.Key(keys[i])
			);
		}
		
		CLICKTOOLS.logger=CLICKTOOLS.logger || new CLICKTOOLS.Logger();
	
	}

	this.sort=function(key) {
	
		var index=-1,
			refresh=false;
		
		if (typeof key!='undefined') {
			index=self.keys.indexOf(key);
		}
		else {
			refresh=true;
			var sortKey=(self.sortKey()=='')?self.defaultSort.key:self.sortKey();
			var sortOrder=(self.sortOrder()=='')?self.defaultSort.order:self.sortKey();
			var keys=self.keys();
			
			for (var i=0, ii=keys.length;i<ii;i++) {
				if (keys[i].name==sortKey) {
					index=i;
					key=self.keys()[i];
					break;
				}
			}
		}
		
		if (index!=-1) {
			self.sorting(true);

			if (refresh) {
				if (self.sortOrder()==CONSTANTS.ASCENDING) {
					self.data().sort(key.sortAscending);
					self.sortOrder(CONSTANTS.ASCENDING);
				}			
				else {
					self.data().sort(key.sortDescending);
					self.sortOrder(CONSTANTS.DESCENDING);
				}				
			}
			else if (key.name==self.sortKey()) {
				if (self.sortOrder()==CONSTANTS.ASCENDING) {
					self.data().sort(key.sortDescending);
					self.sortOrder(CONSTANTS.DESCENDING);
				}			
				else {
					self.data().sort(key.sortAscending);
					self.sortOrder(CONSTANTS.ASCENDING);
				}
			}
			else {
				self.data().sort(key.sortAscending);
				self.sortOrder(CONSTANTS.ASCENDING);
			}

			self.sortKey(key.name);
			self.sorting(false);

			var message=CLICKTOOLS.logger.MESSAGES.SORT
					.replace('{{SORTORDER}}', self.sortOrder())
					.replace('{{SORTKEY}}', key.label);

			CLICKTOOLS.logger.logAction(message);

		}
		
	};

	this.initialise();
	
	return this;
	
};

