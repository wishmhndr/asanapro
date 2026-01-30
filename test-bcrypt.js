const bcrypt = require('bcryptjs');

async function test() {
    const pin = '123456';
    console.log('PIN:', pin);

    const hash = await bcrypt.hash(pin, 10);
    console.log('Generated Hash:', hash);

    const match = await bcrypt.compare(pin, hash);
    console.log('Compare (Correct):', match);

    const matchWrong = await bcrypt.compare('000000', hash);
    console.log('Compare (Wrong):', matchWrong);
}

test();
