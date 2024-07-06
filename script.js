

let currentData = {
    mach: 0,
    altitude_10k: 0,
    fuel: 0,
    weapon4: 0,
    fuel_consume: 0,
    type: "",
    nozzle_angle: 0,
    compass: 0,
    gears: 0,
    gear_c_indicator: 0,
    blister1: 0,
    airbrake_lever: 0,
    gear_lamp_down: 0,
    aoa: 0,
    g_meter: 0
};

let targetData = {
    mach: 0,
    altitude_10k: 0,
    fuel: 0,
    weapon4: 0,
    fuel_consume: 0,
    type: "",
    nozzle_angle: 0,
    compass: 0,
    gears: 0,
    gear_c_indicator: 0,
    blister1: 0,
    airbrake_lever: 0,
    gear_lamp_down: 0,
    aoa: 0,
    g_meter: 0
};

let stopLoop = false;
let abortController = new AbortController();

function interpolate(current, target, alpha) {
    return current + (target - current) * alpha;
}

function updateDisplay() {
    const alpha = 0.06; // Interpolation factor, adjust for smoothness

    currentData.mach = interpolate(currentData.mach, targetData.mach, alpha);
    currentData.altitude_10k = interpolate(currentData.altitude_10k, targetData.altitude_10k, alpha);
    currentData.fuel = interpolate(currentData.fuel, targetData.fuel, alpha);
    currentData.weapon4 = interpolate(currentData.weapon4, targetData.weapon4, alpha);
    currentData.fuel_consume = interpolate(currentData.fuel_consume, targetData.fuel_consume, alpha);
    currentData.nozzle_angle = interpolate(currentData.nozzle_angle, targetData.nozzle_angle, alpha);
    currentData.throttle = interpolate(currentData.throttle1, targetData.throttle, alpha);
    currentData.compass = interpolate(currentData.compass, targetData.compass, alpha);
    currentData.gears = interpolate(currentData.gears, targetData.gears, alpha);
    currentData.gear_lamp_down = interpolate(currentData.gear_lamp_down, targetData.gear_lamp_down, alpha);
    currentData.gear_c_indicator = interpolate(currentData.gear_c_indicator, targetData.gear_c_indicator, alpha);
    currentData.blister1 = interpolate(currentData.blister1, targetData.blister1, alpha);
    currentData.airbrake_lever = interpolate(currentData.airbrake_lever, targetData.airbrake_lever, alpha);
    currentData.aoa = interpolate(currentData.aoa, targetData.aoa, alpha);
    currentData.g_meter = interpolate(currentData.g_meter, targetData.g_meter, alpha);
    currentData.type = targetData.type; // No interpolation needed for type

    document.getElementById('speed').innerText = `MACH: ${currentData.mach.toFixed(2)}`;
    document.getElementById('alt').innerText = `ALT: ${currentData.altitude_10k.toFixed(0)}`;
    document.getElementById('fuel').innerText = `FUEL: ${currentData.fuel.toFixed(0)}`;
    document.getElementById('type').innerText = `MODEL: ${currentData.type}`;
    document.getElementById('cfuel').innerText = `FUEL FLOW: ${currentData.fuel_consume.toFixed(0)}`;
    document.getElementById('compassn').innerText = `[${currentData.compass.toFixed(0)}]`;

    // mostradores

    const arrow = document.getElementById('arrow');
    arrow.style.transform = `rotate(${targetData.nozzle_angle}deg)`;

    const arrow2 = document.getElementById('arrow2');
    arrow2.style.transform = `rotate(${targetData.throttle * 90}deg)`;
    const arrowe = document.getElementById('enginearrow2');
    arrowe.style.transform = `rotate(${targetData.throttle * 90}deg)`;

    const wings = document.getElementById('wings')
    wings.style.transform = `rotate(${targetData.wing_sweep_indicator * -90}deg)`;

    const compass = document.getElementById('compass');
    compass.style.transform = `rotate(${currentData.compass * -1}deg)`;

    const alavanca = document.getElementById('alavanca');
    alavanca.style.top = `${currentData.gears * 35}px`;

    const aoa = document.getElementById('aoa');
    aoa.style.height = `${targetData.aoa * 2}px`;

    const g_meter = document.getElementById('g_meter');
    g_meter.style.height = `${targetData.g_meter * 8}px`;

    const led1 = document.getElementById('led1');
    if (targetData.gears_c_indicator >= 1.0 || targetData.gear_lamp_down >= 1.0) {
        led1.classList.add('led-active');
        led1.classList.remove('led-inactive');
    } else {
        led1.classList.add('led-inactive');
        led1.classList.remove('led-active');
    }

    const led2 = document.getElementById('led2');
    if (targetData.blister1 >= 1.0) {
        led2.classList.add('led-active1');
        led2.classList.remove('led-inactive1');
    } else {
        led2.classList.add('led-inactive1');
        led2.classList.remove('led-active1');
    }

    const led3 = document.getElementById('led3');
    if (targetData.airbrake_lever >= 1.0) {
        led3.classList.add('led-active2');
        led3.classList.remove('led-inactive2');
    } else {
        led3.classList.add('led-inactive2');
        led3.classList.remove('led-active2');
    }
    

    // Calculate remaining fuel time
    if (currentData.fuel_consume > 0) {
        const remainingMinutes = currentData.fuel / currentData.fuel_consume;
        const minutes = Math.floor(remainingMinutes);
        const seconds = Math.floor((remainingMinutes - minutes) * 60);
        document.getElementById('time').innerText = `FLYING TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        document.getElementById('time').innerText = "TIME REMAINING: N/A";
    }
}

async function fetchSpeed() {
    try {
        const response = await fetch('http://localhost:8111/indicators', { signal: abortController.signal });
        const data = await response.json();

        targetData.mach = data.mach;
        targetData.altitude_10k = data.altitude_10k;
        targetData.fuel = data.fuel;
        targetData.weapon4 = data.weapon4;
        targetData.fuel_consume = data["fuel_consume"];
        targetData.type = data.type;
        targetData.valid = data.valid
        targetData.nozzle_angle = data.nozzle_angle;
        targetData.throttle = data.throttle;
        targetData.wing_sweep_indicator = data.wing_sweep_indicator;
        targetData.compass = data.compass;
        targetData.gears = data.gears;
        targetData.gear_c_indicator = data.gear_c_indicator;
        targetData.gear_lamp_down = data.gear_lamp_down;
        targetData.blister1 = data.blister1;
        targetData.airbrake_lever = data.airbrake_lever;
        targetData.aoa = data.aoa;
        targetData.g_meter = data.g_meter;

        handleValidState(data.valid);


    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Error fetching speed data:', error);
        }
    }
}

function handleValidState(valid) {
    if (valid && !hasReceivedTrue) {
        resetScript();
        hasReceivedTrue = true;
    } else if (!valid) {
        hasReceivedTrue = false;
    }
}


async function updateSpeedLoop() {
    stopLoop = false;
    while (!stopLoop) {
        await fetchSpeed();
        await new Promise(resolve => setTimeout(resolve, 150)); // Fetch new data every second
    }
}

function animationLoop() {
    if (stopLoop) return;
    updateDisplay();
    requestAnimationFrame(animationLoop);
}

function resetScript() {

    // Create a new AbortController for the next run
    abortController = new AbortController();

    // Reset data
    currentData = {
        mach: 0,
        altitude_10k: 0,
        fuel: 0,
        weapon4: 0,
        fuel_consume: 0,
        type: "",
        nozzle_angle: 0,
        compass: 0,
        gears: 0,
        gear_c_indicator: 0,
        blister1: 0,
        airbrake_lever: 0,
        aoa: 0,
        g_meter: 0
    };
    // Restart loops

}



// Start the update loop when the page loads
window.onload = () => {
    updateSpeedLoop();
    animationLoop();

    // document.getElementById('sync').addEventListener('click', () => {
    //     location.reload();
    // });
    document.getElementById('synctrue').addEventListener('click', () => {
        resetScript();
    });
};