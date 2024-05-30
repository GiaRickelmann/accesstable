/*
Gia Rickelmann
project 08
*/
class workFlowVT {
	constructor(table, recentChanges, globalNav){
		this.table = document.getElementById(table);
		this.tbody = this.table.querySelector('tbody');
		this.thead = this.table.querySelector('thead');
		this.th = this.thead.getElementsByTagName('th');
		this.thLength = this.th.length;
		this.recentChangesContainer = document.getElementById(recentChanges).children[1];
		this.globalNav = document.getElementById(globalNav);
		this.globalNavMenu = this.globalNav.getElementsByTagName('ul')[0];
	}
	async setUpRC(){
		const data = await workFlowVTUtility.fetchInfo('recent-changes.json');
		const list = document.createElement('ul');
		data.changes.forEach(change => {
			const li = document.createElement('li');
			const anchor = document.createElement('a');
			anchor.href = change.id.toLowerCase() + '.html';
			anchor.textContent = change.id;
			anchor.title = change.txt;
			li.appendChild(anchor);
			li.append(' (' + change.status + ')');
			list.appendChild(li);
		  });
		  this.recentChangesContainer.appendChild(list);
	}
	async setUpDT(){
		const data = await workFlowVTUtility.fetchInfo('issues-data.json');
		//for each row make a row, cells, and set attributes in the table
		data.issues.forEach (issue => {
			const tr = document.createElement('tr');
			const th = document.createElement('th');
			const issueTypeTd = document.createElement('td');
			const issueDesTd = document.createElement('td');
			const issueDesA = document.createElement('a');
			const issuePriorityTd = document.createElement('td');
			const issueAssignTd = document.createElement('td');
			tr.setAttribute('data-priority', issue.priority.toLowerCase());
			th.setAttribute('scope', 'row');
			th.setAttribute('data-cell', 'ID');
			issueDesA.href = issue.project + '-' + issue.id + ".html";
			th.textContent = issue.id;
			issueTypeTd.textContent = issue.type;
			issueTypeTd.setAttribute('data-cell', 'Type');
			issueDesTd.setAttribute('data-cell', 'Description');
			issueDesA.textContent = issue.desc;
			issuePriorityTd.textContent = issue.priority;
			issuePriorityTd.setAttribute('data-cell', 'Priority');
			issueAssignTd.textContent = issue.assigned;
			issueAssignTd.setAttribute('data-cell', 'Assigned');
			tr.appendChild(th);
			//if columns are moved around the append order would need to be changed
			tr.appendChild(issueTypeTd);
			issueDesTd.appendChild(issueDesA);
			tr.appendChild(issueDesTd);
			tr.appendChild(issuePriorityTd);
			tr.appendChild(issueAssignTd);
			this.tbody.appendChild(tr);
		});
	//update the table rows after the table is made
	this.tr = this.tbody.getElementsByTagName('tr');
	this.trLength = this.tr.length;
	}
	async setUp(){
		//wait for the table to set up and the tr variables to be updated
		await this.setUpDT();
		//create small display nav menu button
		this.expandMenuButton = document.createElement('button');
		this.expandedMenuImg = document.createElement('img');
		this.expandMenuButton.id = 'expandMoreA';
		this.expandMenuButton.ariaLabel='navigation menu click to toggle';
		this.expandMenuButton.ariaExpanded = 'false';
		this.expandedMenuImg.src = 'i/more.png';
		this.expandMenuButton.appendChild(this.expandedMenuImg);
		this.globalNav.prepend(this.expandMenuButton);
		//create button form
		this.actionForm = document.createElement('form');
		this.actionForm.id = 'actionForm';
		this.actionForm.method = 'post';
		this.actionForm.action = '#';
		//create buttons
		this.priorityButtonKind = document.createElement('input');
		this.highlightButtonKind = document.createElement('input');
		this.typeColumnButtonKind = document.createElement('input');
		this.priorityButtonKind.type = this.highlightButtonKind.type = this.typeColumnButtonKind.type = 'button';
		this.priorityButtonKind.name = this.highlightButtonKind.name = this.typeColumnButtonKind.name = 'actionButton';
		//set button attributes
		this.priorityButtonKind.id = 'Priority';
		this.highlightButtonKind.id = 'Highlight';
		this.typeColumnButtonKind.id = 'TypeColumn';
		this.priorityButtonKind.value = 'Hide Low Priority';
		this.highlightButtonKind.value = 'Highlight Current Row';
		this.typeColumnButtonKind.value = 'Hide Type Column';
		//put in document
		this.actionForm.appendChild(this.priorityButtonKind);
		this.actionForm.appendChild(this.highlightButtonKind);
		this.actionForm.appendChild(this.typeColumnButtonKind);
		this.table.parentNode.insertBefore(this.actionForm, this.table);
		//apply anchors to thead
		for (let i = 0; i < this.thLength; i++){
			const anchor = document.createElement('a');
			anchor.href = '#';
			anchor.innerHTML = this.th[i].innerHTML;
			this.th[i].innerHTML = "";
			this.th[i].appendChild(anchor);
		}
		//createArrow
		this.arrow = document.createElement('a');
		//find type column
		this.findTypeColumn();
		//load settings from local storage on reload
		this.reloadSetting();
		//listeners
		this.actionForm.addEventListener('click', this.buttonActionsToggle.bind(this), false);
		this.tbody.addEventListener('mouseover', this.removeAddHighlight.bind(this), false);
		this.tbody.addEventListener('mouseout', this.removeAddHighlight.bind(this), false);
		this.thead.addEventListener('click', this.toggleSort.bind(this), false);
		this.expandMenuButton.addEventListener('click', this.navMenuExpand.bind(this), false);
		window.addEventListener('resize', this.resizeMovement.bind(this), false);
	}
	buttonActionsToggle(evt){
		const button = workFlowVTUtility.findTarget(evt, 'input', this.actionForm);
		if (button && !button.name === 'actionButton') {return;}
		switch (button.id){
			case 'Priority':
				button.value = button.value === 'Hide Low Priority' ? 'Show Low Priority' : 'Hide Low Priority';
				for (let i = 0; i < this.trLength; i++){if (this.tr[i].getAttribute('data-priority') === 'low') { this.tr[i].classList.toggle("displayHidden");}}
				break;
			case 'Highlight':
				button.value = button.value === 'Highlight Current Row' ? 'Remove Row Highlight' : 'Highlight Current Row';
				break;
			case 'TypeColumn':
				button.value = button.value === 'Hide Type Column' ? 'Show Type Column' : button.value = 'Hide Type Column';
				this.th[this.typeColumnNumber].classList.toggle("displayHidden");
				for (let it = 0; it < this.trLength; it++){ this.tr[it].children[this.typeColumnNumber].classList.toggle("displayHidden");}
				break;
			default:
				break;
		}
		localStorage.setItem(button.id, button.value);
	}
	resizeMovement(){
		if (window.innerWidth >= 800) {
			this.globalNavMenu.style.display = '';
		}
	}
	navMenuExpand(evt){
		const button = workFlowVTUtility.findTarget(evt, 'button', this.actionForm);
		if (button.id === 'expandMoreA') {
			button.ariaExpanded = button.ariaExpanded === 'true' ? 'false' : 'true';
		}
		if (!this.globalNavMenu.style.display || this.globalNavMenu.style.display === 'none') {
			this.globalNavMenu.style.display = 'block';
		} else if (this.globalNavMenu.style.display === 'block') {
			this.globalNavMenu.style.display = 'none';
		}
	}
	findTypeColumn(){
		//finds what number column the type column is in (in case it is modified)
		for (let i = 0; i < this.trLength; i++){
			if (this.th[i].children[0].innerHTML === 'Type'){
				this.typeColumnNumber = i;
				break;
			}
		}
	}
	removeAddHighlight(evt){
		if (this.highlightButtonKind.value === 'Remove Row Highlight') {
			const targetRow = workFlowVTUtility.findTarget(evt, 'tr', this.tbody);
			if (!targetRow) {return;}
			targetRow.classList.toggle('highlight');
		}
	}
	toggleSort(evt){
		const targetColumn = workFlowVTUtility.findTarget(evt, 'th', this.thead);
		if (!targetColumn) {return;}
		let theSortArray = [];
		const targetColumnIndex = targetColumn.cellIndex;
		//determines arrow type and location
		let arrowType = this.arrow.parentNode.classList.contains('upArrow') ? 'downArrow' :  'upArrow' ;
		if (this.arrow.parentNode === targetColumn){
			this.arrow.parentNode.classList.toggle('upArrow');
			this.arrow.parentNode.classList.toggle('downArrow');
			localStorage.setItem('arrowPlacement', targetColumnIndex + " , "+arrowType);
		} else {
			this.arrow.parentNode.classList.remove('upArrow', 'downArrow');
			this.arrowPlacement(targetColumnIndex, 'upArrow');
			arrowType = 'upArrow';
		}
		const textPosition = targetColumn.children.length - 1;
		//determines how to sort the arrays
		switch(targetColumn.children[textPosition].innerText){
			case 'ID':
				theSortArray = this.sortIDArray(theSortArray, targetColumnIndex, arrowType);
				this.implementSortedArray(theSortArray, 'ID');
				break;
			default:
				theSortArray = this.sortArrays(theSortArray, targetColumnIndex, arrowType);
				this.implementSortedArray(theSortArray, 'Other');
				break;
		}
		evt.preventDefault();
	}
	sortIDArray (array, targetColumnIndex, arrowType){
		for (let it=0;it<this.trLength;it++){
			array.push({value: parseInt(this.tr[it].children[targetColumnIndex].textContent, 10), row: this.tr[it]})
		}
		array.sort(function(num1,num2) {
			return arrowType === 'upArrow' ? num1.value - num2.value : num2.value - num1.value;
		});
		return array;
	}
	sortArrays (array, targetColumnIndex, arrowType){
		for (let it=0;it<this.trLength;it++){
			array.push({value: this.tr[it].children[targetColumnIndex].textContent, row: this.tr[it]});
		}
		array.sort((valueA,valueB) => {
			if (valueA.value < valueB.value) {return arrowType === 'upArrow' ? -1 : 1;}
			if (valueA.value > valueB.value) {return arrowType === 'upArrow' ? 1 : -1;}
			return 0;
		});
		return array;
	}
	implementSortedArray(array, sortBy) {
		array.forEach(value => {
			this.tbody.appendChild(value.row);
		});
		localStorage.setItem('sortRowsBy', sortBy);
	}
	arrowPlacement(index, type){
		this.th[index].prepend(this.arrow);
		this.arrow.parentNode.classList.toggle(type);
		localStorage.setItem('arrowPlacement', index + " , "+type);
	}
	reloadSetting(){
		const localStorageLength = localStorage.length;
		let arrowType = 'none';
		let sortRowsBy = 'none';
		let arrowIndex = 'none';
		let theCurrentArray = [];
		for (let it=0;it < localStorageLength;it++) {
			const key = localStorage.key(it);
			const value = localStorage.getItem(key);
			//restores button settings from local storage and determines arrow && row settings
			switch (key){
				case 'Highlight':
					this.highlightButtonKind.value = value;
					break;
				case 'TypeColumn':
					this.typeColumnButtonKind.value = value;
					if (value === 'Show Type Column'){
						this.th[this.typeColumnNumber].classList.toggle("displayHidden");
						for (let it = 0; it < this.trLength; it++){ this.tr[it].children[this.typeColumnNumber].classList.toggle("displayHidden");}
					}
					break;
				case 'Priority':
					this.priorityButtonKind.value = value;
					if (value === 'Show Low Priority'){
						for (let i = 0; i < this.trLength; i++){if (this.tr[i].getAttribute('data-priority') === 'low') { this.tr[i].classList.toggle("displayHidden");}}
					}
					break;
				case 'arrowPlacement':
					arrowIndex = value.split(' , ')[0];
					arrowType =  value.split(' , ')[1];
					this.arrowPlacement(arrowIndex, arrowType);
					break;
				case 'sortRowsBy':
					sortRowsBy = value;
					break;
				default:
					break;
			}
		}
		//arrow and row order restore
		if (arrowType === 'none'){ //default ordering
			this.arrowPlacement(0, 'upArrow');
			theCurrentArray = this.sortIDArray(theCurrentArray, 0, 'upArrow');
			this.implementSortedArray(theCurrentArray, 'ID');
		} else { //load previously used ordering
			if (sortRowsBy === 'ID'){
				theCurrentArray = this.sortIDArray(theCurrentArray, arrowIndex, arrowType);
				this.implementSortedArray(theCurrentArray, 'ID');
			} else {
				theCurrentArray = this.sortArrays(theCurrentArray, arrowIndex, arrowType);
				this.implementSortedArray(theCurrentArray, 'Other');
			}
		}
	}
}
class workFlowVTUtility {
	static findTarget(evt, targetNode, container){
		let currentNode = evt.target;
      	while (currentNode && currentNode !== container) {  
			if (currentNode.nodeName.toLowerCase() === targetNode.toLowerCase()) { return currentNode; }
			else { currentNode = currentNode.parentNode; }
      	}
      	return false;
	}
	static async fetchInfo(fileName){
		try{
			const response = await fetch(fileName);
			const data = response.json();
			return data;
		} catch (error){
			console.log(error);
		}
	}
}
const workFlowVTSetUp = new workFlowVT('projectsTbl', 'utilitynav', 'globalnav');
//set up recent changes
workFlowVTSetUp.setUpRC();
//set up the table and table interactions
workFlowVTSetUp.setUp();