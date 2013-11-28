var colors = ["#00DD00", "#FF0000", "#000000", "#FF0000", "#000000", "#FF0000", "#000000", "#FF0000", "#000000", "#FF0000", "#000000", "#FF0000", "#000000", "#FF0000", "#000000", "#FF0000", "#000000", "#FF0000", "#000000", "#FF0000", "#000000", "#FF0000", "#000000", "#FF0000", "#000000", "#FF0000", "#000000", "#FF0000", "#000000", "#FF0000", "#000000", "#FF0000", "#000000", "#FF0000", "#000000", "#FF0000", "#000000"];
var wheelNums = ['0', '32', '15', '19', '4', '21', '2', '25', '17', '34', '6', '27', '13', '36', '11', '30', '8', '23', '10', '5', '24', '16', '33', '1', '20', '14', '31', '9', '22', '18', '29', '7', '28', '12', '35', '3', '26'];

var startAngle = 0;
var arc = Math.PI / 18.5; // Pie is good, but maths is confusing!!!
var spinTimeout = null;

var spinTime = 0;
var spinTimeTotal = 0;

var ctx;

function drawRouletteWheel() {
    var canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        var outsideRadius = 200;
        var textRadius = 160;
        var insideRadius = 50;

        ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 500, 500);


        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        ctx.font = 'bold 12px Helvetica, Arial';

        for (var i = 0; i < 37; i++) {
            var angle = startAngle + i * arc;
            ctx.fillStyle = colors[i];

            ctx.beginPath();
            ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
            ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
            ctx.stroke();
            ctx.fill();

            ctx.save();
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 0;
            ctx.shadowColor = "rgb(220,220,220)";
            ctx.fillStyle = "yellow";
            ctx.translate(250 + Math.cos(angle + arc / 2) * textRadius,
                250 + Math.sin(angle + arc / 2) * textRadius);
            ctx.rotate(angle + arc / 2 + Math.PI / 2);
            var text = wheelNums[i];
            ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
            ctx.restore();
        }

        //Arrow
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.moveTo(250 - 4, 230 - (outsideRadius + 5));
        ctx.lineTo(250 + 4, 230 - (outsideRadius + 5));
        ctx.lineTo(250 + 4, 230 - (outsideRadius - 5));
        ctx.lineTo(250 + 9, 230 - (outsideRadius - 5));
        ctx.lineTo(250 + 0, 230 - (outsideRadius - 13));
        ctx.lineTo(250 - 9, 230 - (outsideRadius - 5));
        ctx.lineTo(250 - 4, 230 - (outsideRadius - 5));
        ctx.lineTo(250 - 4, 230 - (outsideRadius + 5));
        ctx.fill();
    }
}

function spin(sas, stt) {
    startAngle = 0;
    drawRouletteWheel();
    spinAngleStart = sas;
    spinTime = 0;
    spinTimeTotal = stt;
    rotateWheel();
}

function rotateWheel() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI / 180);
    drawRouletteWheel();
    spinTimeout = setTimeout('rotateWheel()', 30);
}

function stopRotateWheel() {
    clearTimeout(spinTimeout);
    var degrees = startAngle * 180 / Math.PI + 90;
    var arcd = arc * 180 / Math.PI;
    var index = Math.floor((360 - degrees % 360) / arcd);
    ctx.save();
    ctx.font = 'bold 30px Helvetica, Arial';
    var text = wheelNums[index];
    ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250 + 10);
    ctx.restore();
    winner(wheelNums[index]);
}

function easeOut(t, b, c, d) {
    var ts = (t /= d) * t;
    var tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
}
var bets = [];
finished = 0;
drawRouletteWheel();

var socket = io.connect('http://dixon.io:61001');
socket.on('player', function (data) {
    $('#players').append('<p><strong>' + data.number + '</strong> - ' + data.bet + '</p>');
    bets.push(data);
});

socket.on('start', function (data) {
    spin(data.spinAngleStart, data.spinTimeTotal);
});

socket.on('timer', function (data) {
    $('#timer').html(data.remain);
    if (data.remain == '0:05') {
        startAngle = 0;
        drawRouletteWheel();

    }
});


function winner(winValue) {
    finished = 1;
    $('#lastWinners').html('<h2>Last Game Winners</h2>');
    $('#players').html('<h2>Current Bets</h2>');
    x = 0;
    for (var i = 0; i < bets.length; i++) {
        if (bets[i].bet == winValue) {
            x = x + 1;
            $('#lastWinners').append('<p><h2>' + bets[i].number + '</h2></p>');
        }
    }
    bets = [];
    if (x == 0) $('#lastWinners').append('<p><h3>No Winners</h3></p>');
}
