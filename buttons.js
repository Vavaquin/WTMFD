
const clickableArea = document.getElementById('b1');

clickableArea.addEventListener('click', function(event) {



    const engine = document.getElementById('t1');
    const swap = document.getElementById('t2')



    engine.style.display = 'flex';
    swap.style.display = 'none'

});


const clickableArea2 = document.getElementById('b2');

clickableArea2.addEventListener('click', function(event) {



    const engine = document.getElementById('t1');
    const swap = document.getElementById('t2')



    engine.style.display = 'none';
    swap.style.display = 'flex'

});


