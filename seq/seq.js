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
    csound.CompileOrc(
        "instr 1\n" +
        "iAmpl = ampdbfs(p4)\n" +
        "iFreq = p5\n" +
        "aEnv linseg 0, 0.05, 1, p3 - 0.1, 1, 0.05, 0\n" +
        "aOut vco2 iAmpl, iFreq\n" +
        "aOut = aOut * aEnv\n" +
        "aOut moogladder aOut, 2000, 0.3\n" +
        "outs aOut, aOut\n" +
        "endin\n"
    )
    document.getElementById('loader').style.display = 'none'
}

function NoteGridController($scope, $timeout) {
    $scope.scales = scales
    $scope.selected = {
        scale: $scope.scales['Major ET'],
        bpm: 120,
        lastBpm: 120,
        colCount: 8
    }

    $scope.bpmChanged = function() {
        if (angular.isNumber($scope.selected.bpm)) {
            $scope.selected.lastBpm = $scope.selected.bpm
        } else {
            $scope.selected.bpm = $scope.selected.lastBpm
        }
        console.log("bpmChanged called")
    }

    $scope.colCountChanged = function() {
        var oldColCount = $scope.noteGrid[0].length
        if (!angular.isNumber($scope.selected.colCount)) {
            $scope.selected.colCount = oldColCount
            return
        }
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
        var event = "i1 0 0.5 -12 " + freq
        csound.Event(event)
        console.log(event)
    }

    $scope.toggleEnabled = function(cell) {
        cell.enabled = ! cell.enabled
    }

    $scope.stopRunning = undefined
    $scope.gridStep = function(col) {
	if (col >= $scope.noteGrid[0].length) {
	    col = 0
	}
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
        col = (col + 1) % $scope.noteGrid[0].length
        $scope.stopRunning = $timeout(function () { $scope.gridStep(col) }, 60000/$scope.selected.bpm)
    }

    $scope.running = false
    $scope.runningButtonText = function() { return $scope.running ? 'Stop' : 'Start' }
    $scope.toggleRunning = function() {
        $scope.running = ! $scope.running
        if ($scope.running) {
            $scope.gridStep(0)
        } else {
            if (angular.isDefined($scope.stopRunning)) {
                $timeout.cancel($scope.stopRunning)
                $scope.stopRunning = undefined
                for (var row = 0; row < $scope.noteGrid.length; row++) {
                    for (var col = 0; col < $scope.noteGrid[row].length; col++) {
                        $scope.noteGrid[row][col].active = false
                    }
                }
            }
        }
    }
}
