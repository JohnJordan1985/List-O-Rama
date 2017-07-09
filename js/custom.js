// Contains the JavaScript necessary for the List-O-Rama site to function
// Written by John Jordan on 8th July 2017


// Save reference to elements
var $todoList = $("#task-list");
var $userInput = $("#new-task-content");

var $emptyListMessage = $("#empty-list-message");

var $spacers = $("#spacers");
var newListContent;
var $listItems;
// Grab the span within the copyright notice in the page's footer
var $writeCopyrightYear = $("#copyright-year");
// Create new date object
var date = new Date();
// Get the current year of newly created date object
var currentYear = date.getFullYear();
// Write the current year to the copyright notice
$writeCopyrightYear.text(" " + currentYear + ". All Rights Reserved.")

$listCreator = $("#list-creator");
$clearCheckedButton = $("#clearChecked");

if(localStorage.myStoredList) {
	// Loads stored list items
	loadSavedListItems();

} else {
	// If it doesn't exist, create it
	localStorage.myStoredList = "";
}

function saveToLocalStorage($listItems) {

	var saveArray = [];

	// Each loop that iterates over the jQuery Collection of list elements and creates copies of it
	$.each($listItems, function(index, value) {

		cloneItem = this.cloneNode(true);
		// Push cloned node to saveArray
		saveArray.push(cloneItem.outerHTML);
	});
	// Convert saveArray to a string for storing using localStorage
	localStorage.myStoredList = JSON.stringify(saveArray);
};

function applyCheckToggle () {

	// Needed to manually refresh the list items being stored in the $listItems variable as it doesn't actively monitor for changes on its elements
	$listItems = $("ul li");
	// Applies event listener to all these list items
	$listItems.on("click", function () {

		$(this).toggleClass("checked");


		// START: Alternative method that was neeed when using default checkboxes, as toggling of checked status wasn't
		// happening autmomatically for some reason
		// Find checkbox child element of parent list
		// var $checkBox = $(this).find("input");
		// Get child checkbox status
		// var $checkBoxCheckStatus = $checkBox.prop("checked");
		// Toggle child check box status. Had to use attr method and not prop method to actually change the Boolean
		// 'checked' attribute of the HTML element, as .prop changes the property of the JavaScript object (I think)
		// $checkBox.attr("checked", !$checkBoxCheckStatus);
		// END: alternative method that is now defunct, as returned to using FontAwesome icons

		// Essential that this call to updateList be here, or else the toggleClass behaviour will not be displayed
		updateList();
		// Toggles the empty check-box and the checked-check-box Font Awesome icons on the CHILD span element.
		// START: This code was designed to be used with the span element, but is redundant when using CSS :before pseudo selector solution
		// $(this).children('span').toggleClass("fa-check-square-o fa-square-o");
		// END:
	});
	// This conditional needed for proper display of Clear Selected button on page load
	if ($listItems.length > 0) {
		$clearCheckedButton.slideDown();
		// First clear the previous empty-list-message. Using the stored $emptyListMessage variable didn't work, so had to re-query the DOM,
		// which worked fine
		$("#empty-list-message").remove();

	} else{
		$clearCheckedButton.slideUp();
	}
	saveToLocalStorage($listItems);
};

// The purpose of this function is to remove the fadeOut class from the checked list items BEFORE they are stored locally.
// If this is not done, then when the user resets the page, the previously checked items in storage will still have the fadeOut class
// applied and will fade-out on page load.

function removeFadeOutClass () {
	// Following code removes those checked list items that have the fadeOut class applied, which implies that they were
	// selected to be removed by the user and therefore, should not be saved to localStorage. This code could not have been put in the
	// saveToLocalStorage function, as repeated calls to this function were made (after every update to the DOM in fact)
	// and therefore the remove method would have removed the list element from DOM before the fade animation had finished
	$("li.checked.fadeOut").remove();
};


function loadSavedListItems() {
	// Loads items from localStorage.myStoredList (stored as a string) and appends them to ul element using an 'each' loop on the jQuery collection
	var saved = JSON.parse(localStorage.myStoredList);
	$.each(saved, function(index, value) {
		// Appends the loaded HTML elements to the task-list ul element
		$todoList.append(value);
	});

	// removes fadeOut class from checked list items for reasons mentioned
	removeFadeOutClass();

	// Call to function to apply event listener to list items present on screen
	applyCheckToggle();
};

function updateList() {
	// Needed to manually refresh the list items being stored in the $listItems variable as it doesn't actively monitor for changes on its elements
	$listItems = $("ul li");

	// Makes call to this function with list of user tasks, a jQuery Collection, to store them after changes
	saveToLocalStorage($listItems);
	// Empties pre-existing list to avoid duplication
	$todoList.empty();
	// Loads information from localStorage
	var storedArrayOfListItems = JSON.parse(localStorage.myStoredList);

	$.each(storedArrayOfListItems, function(index, value) {
		// Appends the loaded HTML elements to the task-list ul element
		$todoList.append(value);
	});

	// Call to function to apply event listener to list items present on screen
	applyCheckToggle();

	// Makes this final call to this function with list of user tasks, a jQuery Collection, to store them after applying the 'click' Event Listener
	saveToLocalStorage($listItems);
};

$listCreator.on('submit', function(){
	newListContent = $userInput.val();
	// Default Bootstrap class of 'list-group-item' applied to newly created list element
	$todoList.append("<li class='list-group-item custom-icon'>" + "<h4>" + newListContent + "</h4>" + "</li>");
	// START: Alternative approach using default checkbox element, which was abandoned to use FontAwesome icons instead
	// $todoList.append("<li class='list-group-item'><div><input type='checkbox' id='" + newListContent + "'" + " checked='checked'><label for='" + newListContent + "'" + ">" + newListContent + "</label></div></li>")
	// Another alternative method that doesn't require label for attribute and id
	// $todoList.append("<li class='list-group-item'><div><label><input type='checkbox' id='" + newListContent + "'" + ">" + newListContent + "</label></div></li>")
	// END: alternative
	// Clears input box of previously entered text
	$userInput.val("");
	// Updates the list
	updateList();
});

$clearCheckedButton.click(function(){
	// Firstly, an animation effect is applied to the list items to be removed, but doesn't remove them from the DOM
	// NB: Could not get fadeOut method to work for some damned reason, completely infuriating, as it worked in console
	$("li.checked").addClass("fadeOut");
	// END NB
	// Removes all those list elements from the DOM, which have the checked class applied when the button is pressed. This removal from DOM
	// is done AFTER the 2 second fadeOut animatinon has run
	setTimeout(function() {
		$("li.checked").remove();
	}, 1050);
	// NB. Due to the call to updateList function, checked list items that have been removed, will be saved to local storage, even though
	// they should not be, due to the following series of calls: updateList() -> applyCheckToggle() -> saveToLocalStorage(). I couldn't have
	// removed the checked list items with fadeOut class applied from within the saveToLocalStorage function, as repeated calls to this function
	// were made (after every update to the DOM in fact) and therefore the remove method would have removed the list element from DOM before
	// the fade animation had finished. Hence, I removed these list items from within the loadFromLocalStorage function
	// END NB
	// Call to this function to update the list in case any elements were removed, else this information would be lost on page close/refresh
	updateList();

	// Purpose of this code is to remove the clearCheckedButton when there are no list items left - happens slightly after the list is cleared

	setTimeout(function(){
		$listItems = $("ul li");
		if ($listItems.length > 0) {
			$clearCheckedButton.slideDown();
		}

		if ($listItems.length === 0) {
			console.log($emptyListMessage);
			$clearCheckedButton.slideUp();
			// This line didn't actually show the empty-task message
			// $emptyListMessage.show();
			// First clear the previous empty-list-message
			$("#empty-list-message").remove();
			// Instead, manually appended the element to the empty unordered list
			$("#task-list-container").append("<p id='empty-list-message'>Your list is empty - please add a to-do item using the input box above.</p>")
		}

	}, 1200);
});
