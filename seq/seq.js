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

var seqApp = angular.module("seqApp", [])

seqApp.directive('fcMouseState', function() {
        return {
            restrict: 'A',
            scope: {
            state: '=fcMouseState'
            },
            link: function(scope, elem, attrs) {
            elem.on('mousedown', function() {
                scope.state = true
            })
            elem.on('mouseup', function() {
                scope.state = false
            })
         }
        }
    }
)

seqApp.directive('fcNumberInput', ['$timeout', function($timeout) {
    return {
      restrict: 'EA',
      replace: true,
      template: '<input type="number">',
      scope: {
        min: '=fcMin',
        max: '=fcMax',
        model: '=fcModel',
        change: '&fcChange'
      },
      link: function(scope, elem, attrs) {
        scope.checkMin = angular.isNumber(scope.min)
        scope.checkMax = angular.isNumber(scope.max)
        elem.addClass('fcNumberInput')
        attrs.$set('type', 'number')

        elem.on('change keyup', function() {
          scope.$apply(processUserInput)
        })

        scope.$watch("model", function() {
          elem.val(scope.model)
          scope.change()
        })

          function changeModel() {
            if (scope.checkMin && scope.candidate < scope.min) {
              scope.candidate = scope.min
              elem.val(scope.min)
            }
            if (scope.checkMax && scope.candidate > scope.max) {
              scope.candidate = scope.max
              elem.val(scope.max)
            }
            scope.model = scope.candidate
            scope.change()
          }

          function processUserInput() {
            if (angular.isDefined(scope.changeModelPromise)) {
              $timeout.cancel(scope.changeModelPromise)
              scope.changeModelPromise = undefined
              console.log('canceled timeout')
            }
            // regex from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt#A_stricter_parse_function
            if (/^(\-|\+)?([0-9]+|Infinity)$/.test(elem.val())) {
              scope.candidate = parseInt(elem.val())
              if (scope.mouseIsDown || Math.abs(scope.candidate - scope.model) == 1) {
                changeModel()
                console.log('set to ' + scope.model + ' synchronously')
              } else {
                scope.changeModelPromise = $timeout(
                  function() {
                    changeModel()
                    console.log('set to ' + scope.model + ' asyncronously')
                  }, 800)
                console.log('submitted timeout')
              }
            } else {
              scope.changeModelPromise = $timeout(
                function() {
                  elem.val(scope.model)
                }, 1200)
            }
          }
      }
    }
  }
])

seqApp.controller('NoteGridController', ['$scope', '$timeout', function($scope, $timeout) {
    $scope.scales = scales
    $scope.instruments = instruments
    $scope.selected = {
        instrument: $scope.instruments['Organ'],
        scale: $scope.scales['Major ET'],
        bpm: 120,
        colCount: 8,
	randomizeEveryN: false,
	randomizeRepeatCount: 4
    }

    $scope.changeColCount = function() {
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
        var duration = 60/$scope.selected.bpm
        var event = "i" + $scope.selected.instrument.number + " 0 " + duration + " " + freq
        csound.Event(event)
        //console.debug(event)
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
    $scope.repeatCount = 0
    $scope.triggerEvent = undefined

    $scope.gridStep = function() {
        if ($scope.eventCol >= $scope.noteGrid[0].length) {
            $scope.eventCol = 0
	}
	if ($scope.eventCol == 0) {
	    $scope.repeatCount++
	    if ($scope.selected.randomizeEveryN &&
		$scope.repeatCount >= $scope.selected.randomizeRepeatCount) {
		$scope.randomize()
		$scope.repeatCount = 0
	    }
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
        $scope.triggerEvent = $timeout($scope.gridStep, 60000/$scope.selected.bpm)
    }

    $scope.running = false
    $scope.runningButtonText = function() { return $scope.running ? 'Stop' : 'Start' }
    $scope.toggleRunning = function() {
        $scope.running = ! $scope.running
        if ($scope.running) {
            $scope.gridStep(0)
	    $scope.repeatCount = 0
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
}])
