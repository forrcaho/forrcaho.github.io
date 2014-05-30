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

scales['Septimal #2'] = [LOW_NOTE,
                         LOW_NOTE * 7.0/6,
                         LOW_NOTE * 5.0/4,
                         LOW_NOTE * 3.0/2,
                         LOW_NOTE * 5.0/3,
                         LOW_NOTE * 7.0/4,
                         LOW_NOTE * 15.0/8,
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
