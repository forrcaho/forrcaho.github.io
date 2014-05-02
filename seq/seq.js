// calculate scales
var LOW_NOTE = 293.6647679174076 // D4
var scales = {}
scales['Major ET'] = [LOW_NOTE,
                      LOW_NOTE * Math.pow(2.0, 2.0/12),
                      LOW_NOTE * Math.pow(2.0, 4.0/12),
                      LOW_NOTE * Math.pow(2.0, 5.0/12),
                      LOW_NOTE * Math.pow(2.0, 7.0/12),
                      LOW_NOTE * Math.pow(2.0, 9.0/12),
                      LOW_NOTE * Math.pow(2.0, 11.0/12),
                      LOW_NOTE * 2.0].reverse()

scales['Major Just'] = [LOW_NOTE,
                        LOW_NOTE * 9.0/8,
                        LOW_NOTE * 5.0/4,
                        LOW_NOTE * 4.0/3,
                        LOW_NOTE * 3.0/2,
                        LOW_NOTE * 5.0/3,
                        LOW_NOTE * 15.0/8,
                        LOW_NOTE * 2.0].reverse()

scales['Minor ET'] = [LOW_NOTE,
                      LOW_NOTE * Math.pow(2.0, 2.0/12),
                      LOW_NOTE * Math.pow(2.0, 3.0/12),
                      LOW_NOTE * Math.pow(2.0, 5.0/12),
                      LOW_NOTE * Math.pow(2.0, 7.0/12),
                      LOW_NOTE * Math.pow(2.0, 8.0/12),
                      LOW_NOTE * Math.pow(2.0, 10.0/12),
                      LOW_NOTE * 2.0].reverse()

scales['Minor Just'] = [LOW_NOTE,
                        LOW_NOTE * 9.0/8,
                        LOW_NOTE * 6.0/5,
                        LOW_NOTE * 4.0/3,
                        LOW_NOTE * 3.0/2,
                        LOW_NOTE * 8.0/5,
                        LOW_NOTE * 9.0/5,
                        LOW_NOTE * 2.0].reverse()

scales['Septimal #1'] = [LOW_NOTE,
                         LOW_NOTE * 7.0/6,
                         LOW_NOTE * 5.0/4,
                         LOW_NOTE * 4.0/3,
                         LOW_NOTE * 3.0/2,
                         LOW_NOTE * 7.0/4,
                         LOW_NOTE * 9.0/5,
                         LOW_NOTE * 2.0].reverse()

scales['Seven Tone ET'] = [LOW_NOTE,
                           LOW_NOTE * Math.pow(2.0, 1.0/7),
                           LOW_NOTE * Math.pow(2.0, 2.0/7),
                           LOW_NOTE * Math.pow(2.0, 3.0/7),
                           LOW_NOTE * Math.pow(2.0, 4.0/7),
                           LOW_NOTE * Math.pow(2.0, 5.0/7),
                           LOW_NOTE * Math.pow(2.0, 6.0/7),
                           LOW_NOTE * 2.0].reverse()

scales['Whole Tone'] = [LOW_NOTE,
                        LOW_NOTE * Math.pow(2.0, 2.0/12),
                        LOW_NOTE * Math.pow(2.0, 4.0/12),
                        LOW_NOTE * Math.pow(2.0, 6.0/12),
                        LOW_NOTE * Math.pow(2.0, 8.0/12),
                        LOW_NOTE * Math.pow(2.0, 10.0/12),
                        LOW_NOTE * 2.0,
                        LOW_NOTE * Math.pow(2.0, 14.0/12)].reverse()

var instruments = {}
instruments['Organ'] = {
    number: 1,
    lines: [
        "iDur = p3",
        "iFreq = p4",
        "aOut vco2 ampdbfs(-12), iFreq",
        "aEnv linseg 0, 0.05, 1, iDur - 0.1, 1, 0.05, 0, 0.1, 0",
        "aOut = aOut * aEnv",
        "aOut moogladder aOut, 2000, 0.3",
        "outs aOut, aOut"
    ]
}
instruments['Plucked String'] = {
    number: 2,
    lines: [
        "iDur = p3",
        "iFreq = p4",
        "aOut pluck ampdbfs(-12), iFreq, iFreq, 0, 1",
        "aEnv linseg 1, iDur - 0.05, 1, 0.05, 0, 0.1, 0",
        "aOut = aOut * aEnv",
        "outs aOut, aOut"
        ]
}
instruments['Sine Wave'] = {
    number: 3,
    lines: [
        "iDur = p3",
        "iFreq = p4",
        "aOut poscil ampdbfs(-18), iFreq",
        "aEnv linseg 0, 0.05, 1, iDur - 0.1, 1, 0.05, 0, 0.1, 0",
        "aOut = aOut * aEnv",
        "outs aOut, aOut"
        ]
}
instruments['Bell'] = {
    number: 4,
    lines: [
        "iDur = p3",
        "iFreq = p4",
	"aOut fmbell ampdbfs(-38), iFreq, 15, 15, 0.005, 6",
        "aEnv linseg 0, 0.01, 1, iDur - 0.11, 1, 0.1, 0, 0.1, 0",
        "aOut = aOut * aEnv",
	"outs aOut, aOut"
    ]
}


// build noteGrid
var rowCount = 8
var colCount = 8
var noteGrid = new Array(rowCount)
for (var i = 0 ; i < noteGrid.length; i++) {
    noteGrid[i] = new Array(colCount)
    for (var j = 0; j < noteGrid[i].length; j++) {
        noteGrid[i][j] = { enabled: false, active: false }
    }
}

// called by csound.js

function moduleDidLoad() {
    csound.Play()
    var orchestra = ""
    for (var name in instruments) {
        instrument = instruments[name]
        orchestra += "instr " + instrument.number + "\n"
        for (var i = 0 ; i < instrument.lines.length; i++) {
            orchestra += instrument.lines[i] + "\n"
        }
        orchestra += "endin\n"
    }
    console.debug(orchestra)
    csound.CompileOrc(orchestra)
    document.getElementById('loader').style.display = 'none'
}

function NoteGridController($scope, $timeout) {
    $scope.scales = scales
    $scope.instruments = instruments
    $scope.selected = {
        instrument: $scope.instruments['Organ'],
        scale: $scope.scales['Major ET'],
        bpm: 120,
        colCount: 8
    }

    /*
      Change BPM code. This is a real mess, but it works (/me crosses fingers).
 
      The problem is that there are two ways the user can change BPM: by using the
      spinner arrows, and by typing in numbers. When the spinner arrows are used, we
      want to respond right away, but when the user is typing in a number, we want to 
      give them some time to complete typing.

      We do this by calling our change function (changeBpmFunction()) synchronously if 
      the bpm value has changed by 1, because this means the user is probably using the
      spinner arrows, but call it asynchronously with $timeout if the difference is 
      greater, because then the user is typing in a number.

      The cast of characters:

      $scope.bpm              -- bpm value actually used
      $scope.maxBpm           -- max bpm value, reset to this if exceeded
      $scope.minBpm           -- min bpm value, reset to this if underrun
      $scope.selected.bpm     -- bpm value entered, set by AngularJS
      $scope.bpmChanged       -- function called by AngularJS when user changes bpm
      changeBpmFunction       -- function called when bpm is changed (note local scope)
                                 called either synchronously or asyncrhonously
      $scope.changeBpmPromise -- promise returned when changeBpmFunction is called
                                 asynchronously
    */

    $scope.minBpm = 30
    $scope.maxBpm = 500
    $scope.bpm = $scope.selected.bpm
    $scope.changeBpmPromise = undefined

    var changeBpmFunction = function() {
        if ($scope.selected.bpm > $scope.maxBpm) {
            $scope.selected.bpm = $scope.maxBpm
        } else if ($scope.selected.bpm < $scope.minBpm) {
            $scope.selected.bpm = $scope.minBpm
        }
        var speedUp = ($scope.selected.bpm >= 10 * $scope.bpm)
        $scope.bpm = $scope.selected.bpm
        if (speedUp) {
            if (angular.isDefined($scope.triggerEvent)) {
                $timeout.cancel($scope.triggerEvent)
                $scope.triggerEvent = $timeout($scope.gridStep, 60000/$scope.bpm)
            }
        }
    }

    $scope.bpmChanged = function() {
        if (angular.isDefined($scope.changeBpmPromise)) {
 	    $timeout.cancel($scope.changeBpmPromise)
	    $scope.changeBpmPromise = undefined
        }
        if (angular.isNumber($scope.selected.bpm)) {
	    if (Math.abs($scope.selected.bpm - $scope.bpm) == 1) {
		changeBpmFunction()
	    } else {
		$scope.changeBpmPromise = $timeout(changeBpmFunction, 500)
	    }
        } else {
            $scope.changeBpmPromise = $timeout(function() { 
		$scope.selected.bpm = $scope.bpm
	    }, 1000)
        }
    }


    /*
      Change Pattern Length code. This follows the same strategy as the change BPM
      code above. This really should be abstracted so both functions can use the 
      same code, but I haven't figured out how to do that yet. It's on the list for
      refactoring. Patches welcome!
     */

    $scope.minColCount = 2
    $scope.maxColCount = 20
    $scope.changeColCountPromise = undefined

    var changeColCountFunction = function() {
        if ($scope.selected.colCount < $scope.minColCount) {
            $scope.selected.colCount = $scope.minColCount
        } else if ($scope.selected.colCount > $scope.maxColCount) {
            $scope.selected.colCount = $scope.maxColCount
        }
        var oldColCount = $scope.noteGrid[0].length
        var newColCount = $scope.selected.colCount
        if (newColCount < oldColCount) {
            for (var row = 0; row < $scope.noteGrid.length; row++) {
                $scope.noteGrid[row].length = newColCount;
            }
        } else {
            for (var col = oldColCount; col < newColCount; col++) {
                for (var row = 0; row < $scope.noteGrid.length; row++) {
                    $scope.noteGrid[row][col] = { enabled: false, active: false }
                }
            }
        }
    }

    $scope.colCountChanged = function() {
        if (angular.isDefined($scope.changeColCountPromise)) {
            $timeout.cancel($scope.changeColCountPromise)
            $scope.changeColCountPromise = undefined
        }
        if (angular.isNumber($scope.selected.colCount)) {
	    if (Math.abs($scope.noteGrid[0].length - $scope.selected.colCount) == 1) {
		changeColCountFunction()
	    } else {
		$scope.changeColCountPromise = $timeout(changeColCountFunction, 500)
	    }
        } else {
            $scope.changeColCountPromise = $timeout(function() {
                $scope.selected.colCount = $scope.noteGrid[0].length
            }, 1000)
        }
    }

    $scope.noteGrid = noteGrid
    $scope.noteCellState = function(cell) {
        if (cell.active) { return 'active' }
        if (cell.enabled) { return 'enabled' }
        return 'disabled'
    }

    $scope.activateCell = function(row, col) {
        $scope.noteGrid[row][col].active = true
        // csound thing here to play note
        var freq = $scope.selected.scale[row]
        var duration = 60/$scope.bpm
        var event = "i" + $scope.selected.instrument.number + " 0 " + duration + " " + freq
        csound.Event(event)
        console.debug(event)
    }

    $scope.mouseIsDown = false
    $scope.setMouseDown = function(state) {
        $scope.mouseIsDown = state
    }
    $scope.mouseEnteredCell = function(cell) {
        if ($scope.mouseIsDown) {
            $scope.toggleEnabled(cell)
        }
    }

    $scope.toggleEnabled = function(cell) {
        cell.enabled = ! cell.enabled
    }

    $scope.clear = function() {
        for (var col = 0; col < $scope.noteGrid[0].length; col++) {
            for (var row = 0; row < $scope.noteGrid.length; row++) {
                $scope.noteGrid[row][col].enabled = false
            }
        }
    }

    function enableRandomRow(col) {
        var randomRow = Math.floor(Math.random() * $scope.noteGrid.length * 0.9999999)
        $scope.noteGrid[randomRow][col].enabled = true
    }

    $scope.randomize = function() {
        $scope.clear()
        for (var col = 0; col < $scope.noteGrid[0].length; col++) {
            if (Math.random() > 0.88) { continue }
            enableRandomRow(col)
            if (Math.random() > 0.70) { continue }
            enableRandomRow(col)
            if (Math.random() > 0.52) { continue }
            enableRandomRow(col)
            if (Math.random() > 0.34) { continue }
            enableRandomRow(col)
            if (Math.random() > 0.16) { continue }
            enableRandomRow(col)
            if (Math.random() > 0.02) { continue }
            enableRandomRow(col)
        }
    }

    $scope.invert = function() {
        var lowRow = 0
        var hiRow = $scope.noteGrid.length - 1
        var tmpCell
        while (hiRow > lowRow) {
            for (var col = 0; col < $scope.noteGrid[0].length; col++) {
                tmpCell = $scope.noteGrid[lowRow][col]
                $scope.noteGrid[lowRow][col] = $scope.noteGrid[hiRow][col]
                $scope.noteGrid[hiRow][col] = tmpCell
            }
            lowRow++
            hiRow--
        }
    }

    $scope.retrograde = function() {
        var lowCol = 0
        var hiCol = $scope.noteGrid[0].length - 1
        var tmpCell
        while (hiCol > lowCol) {
            for (var row = 0; row < $scope.noteGrid.length; row++) {
                tmpCell = $scope.noteGrid[row][lowCol]
                $scope.noteGrid[row][lowCol] = $scope.noteGrid[row][hiCol]
                $scope.noteGrid[row][hiCol] = tmpCell
            }
            lowCol++
            hiCol--
        }
    }

    $scope.eventCol = 0
    $scope.triggerEvent = undefined
    $scope.gridStep = function() {
        if ($scope.eventCol >= $scope.noteGrid[0].length) {
            $scope.eventCol = 0
        }
        var col = $scope.eventCol
        var lastCol = col - 1
        if (lastCol < 0) {
            lastCol = $scope.noteGrid[0].length - 1
        }
        for (var row = 0; row < $scope.noteGrid.length; row++) {
            $scope.noteGrid[row][lastCol].active = false
            if ($scope.noteGrid[row][col].enabled) {
                $scope.activateCell(row, col)
            }
        }
        $scope.eventCol = (col + 1) % $scope.noteGrid[0].length
        $scope.triggerEvent = $timeout($scope.gridStep, 60000/$scope.bpm)
    }

    $scope.running = false
    $scope.runningButtonText = function() { return $scope.running ? 'Stop' : 'Start' }
    $scope.toggleRunning = function() {
        $scope.running = ! $scope.running
        if ($scope.running) {
            $scope.gridStep(0)
        } else {
            if (angular.isDefined($scope.triggerEvent)) {
                $timeout.cancel($scope.triggerEvent)
                $scope.triggerEvent = undefined
                for (var row = 0; row < $scope.noteGrid.length; row++) {
                    for (var col = 0; col < $scope.noteGrid[row].length; col++) {
                        $scope.noteGrid[row][col].active = false
                    }
                }
            }
        }
    }
}
