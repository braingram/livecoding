/* Author:
	Gabriel Florit
*/

var aigua = (function () {
	return {
		renderCode: function() {
			// clear out the display contents
			$('svg').empty();

			// get the code
			var code = aigua.codeMirror.getValue();

			// run it
			eval(code);
		},
		borderWidth: Number($('#bar').css('border-width').replace('px', '')),
		lineHeight: 19,
		samples: ['data/chord.txt'],
		originalNumber: null,
		startingBarWidth: 200
	}
}());

$(function() {

	// set the handle's default width
	$('#handle').width(aigua.startingBarWidth);

	// create codemirror instance
	aigua.codeMirror = CodeMirror($('#code').get(0), {

		onChange: function(cm, e) {
			aigua.renderCode();
		},

		onKeyEvent: function(cm, e) {

			var cursor;
			var token;
			var startCoords;
			var endCoords;
			var center;

			// did we keydown the ctrl key?
			if (e.ctrlKey && e.type == 'keydown') {

				// is the handle hidden?
				if (!$('#handle').is(':visible')) {

					// grab the current token
					cursor = cm.getCursor();
					token = cm.getTokenAt(cursor);

					// are we on a number?
					if (token.className == 'number') {

						// save the original number
						if (aigua.originalNumber == null) {
							aigua.originalNumber = Number(token.string);
						}

						// select token
						cm.setSelection({line: cursor.line, ch: token.start}, {line: cursor.line, ch: token.end});

						// find coords at token start
						startCoords = cm.cursorCoords(true);
						endCoords = cm.cursorCoords(false);

						// center marker on token
						center = startCoords.x + (endCoords.x - startCoords.x)/2;
						$('#marker').css('left', center);

						// center handle on token
						$('#handle').css('left', center - $('#handle').width()/2);

						// show the handle
						$('#handle').show();

						// position the bar centered above the token
						$('#bar').css('left', center - $('#bar').width()/2 - aigua.borderWidth);
						$('#bar').css('top', startCoords.y - aigua.lineHeight);

						// show the bar
						$('#bar').show();
					}
				}
			}

			// did we keyup?
			if (e.type == 'keyup') {

				// hide the handle
				$('#handle').hide();

				// reset filler width
				$('#filler').width(0);

				// reset bar width
				$('#bar').width(aigua.startingBarWidth);

				// hide the bar
				$('#bar').hide();

				// clear out the original number
				aigua.originalNumber = null;
			}
		},

		lineNumbers: true,
		matchBrackets: true,
		mode:  'javascript',
		theme: 'lesser-dark'
	});

	// load sample code
	d3.text(aigua.samples[0], function(data) {
		aigua.codeMirror.setValue(data);
	});

	// force svg contents to occupy the entire svg container
	// by rerendering code on window resize
	$(window).on('resize', function() {
		aigua.renderCode();
	});

	// initialize slider
	$('#handle').draggable({
		axis: 'x',
		drag: function(ui, event) {

			var position = event.position.left + $('#handle').width()/2;
			var markerCenter = $('#marker').offset().left;
			var offset = position - markerCenter;
			var newNumber;
			var barLeftPortionWidth;

			// if the original number is larger than 1/-1, increment by 1
			if (Math.abs(aigua.originalNumber) >= 1) {
				newNumber = offset*100 + aigua.originalNumber;
			}
			// otherwise increment by the original number rounded up to the nearest decimal
			else {
				newNumber = offset/10 + aigua.originalNumber; // TODO - this isn't working properly
			}

			// replace the selection with the new number
			aigua.codeMirror.replaceSelection(String(newNumber));

			// is the dragging cursor to the right of the marker?
			if (offset > 0) {

				// first, reset the left bar width and position
				barLeftPortionWidth = markerCenter - $('#bar').offset().left - aigua.borderWidth;
				if (barLeftPortionWidth > aigua.startingBarWidth/2) {

					// reset the width, since fast drags won't trigger a drag call every pixel.
					$('#bar').width(aigua.startingBarWidth);
					$('#bar').css('left', markerCenter - aigua.startingBarWidth/2 - aigua.borderWidth);
					$('#filler').removeClass('filler-edge-left');
				}

				// set the filler width and position
				$('#filler').width(offset);
				$('#filler').css('left', aigua.startingBarWidth/2);

				// are we dragging past the initial bar width?
				if (offset > aigua.startingBarWidth/2 - (aigua.borderWidth)) {

					// round the filler edges
					$('#filler').addClass('filler-edge-right');

					 // add 1 pixel to filler width to prevent square edges
					 // from hitting the round borders prematurely
					$('#filler').width(offset + 1);

					// set bar right edge to dragging position
					$('#bar').width(position - $('#bar').offset().left);
				}

				else {

					// square the filler edges
					$('#filler').removeClass('filler-edge-left');
					$('#filler').removeClass('filler-edge-right');

					// reset the width, since fast drags won't trigger a drag call every pixel. 
					$('#bar').width(aigua.startingBarWidth);
				}

			// is the dragging cursor to the left of the marker?
			} else if (offset < 0) {

				// set the filler width
				$('#filler').width(-offset);

				// adjust the filler position
				$('#filler').css('left', aigua.startingBarWidth/2 - -offset + aigua.borderWidth/2);

				// are we dragging past the initial bar width?
				if (-offset> aigua.startingBarWidth/2) {

					// adjust the filler position
					$('#filler').css('left', aigua.borderWidth/2);

					// round the filler edges
					$('#filler').addClass('filler-edge-left');

					// set bar left edge to dragging position
					$('#bar').width(-offset + aigua.startingBarWidth/2);
					$('#bar').css('left', position - aigua.borderWidth);
				}

				else {

					// square the filler edges
					$('#filler').removeClass('filler-edge-left');
					$('#filler').removeClass('filler-edge-right');

					// reset the width, since fast drags won't trigger a drag call every pixel.
					$('#bar').width(aigua.startingBarWidth);
					$('#bar').css('left', markerCenter - aigua.startingBarWidth/2 - aigua.borderWidth);
				}

			// are we at the middle?
			} else {
				$('#filler').width(0);
			}
		}
	});

});

