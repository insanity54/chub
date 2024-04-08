import { getRandomInt } from './util.js'

const symbols = [
    " ",
    "  ",
    "   ",
    " * ",
    " ~ ",
    " . ",
    " ٩(◕‿◕｡)۶ ",
    " ❀ ",
    " ☆ ",
    " ۞ ",
    " ⁂ ",
    " ⁎ ",
    " ‿︵‿︵‿︵‿︵ ",
    " ❁ ",
    " ✿ ",
    " ⁀⊙﹏☉⁀ ",
    " ❃ ",
    " ❇ ",
    " ⁝ ",
    " ⁘ ",
    " ⁕ ",
    " ⁖ ",
    " ✧ ",
    " ✦ ",
    " ❦ ",
    " ✺ ",
    " ✵ ",
    " ✸ ",
    " ✷ ",
    " ✼ ",
    " ✻ ",
    " ✽ ",
    " ✾ ",
    " ❉ ",
    " ❊ ",
    " ❋ ",
    " ❄ ",
    " ❅ ",
    " ❆ ",
    " ❇ ",
    " ✥ ",
    " ✤ ",
    " ✣ ",
    " ✢ ",
    " ✜ ",
    " ✛ ",
    " ✘ ",
    " ✗ ",
    " ✖ ",
    " ✕ ",
    " ✔ ",
    " ✓ ",
    " ✒ ",
    " ✑ ",
    " ✐ ",
    " ✓ ",
    " ✔ ",
    " ✉ ",
    " ☎ ",
    " ☏ ",
    " ✁ ",
    " ✂ ",
    " ✃ ",
    " ✄ ",
    " ❢ ",
    " 💫 ",
    " ❣ ",
    " ❥ ",
    " ❦ ",
    " ❧ ",
    " ✨ ",
    " ☙ ",
    " ♡ ",
    " ♥ ",
    " ❤️‍🔥 ",
    " ❤️ "
]

export function mutateString(input, varietyLevel) {
    const mutations = [
        capitalizeRandomCharacter,
        insertRandomCharacter,
        removeRandomCharacter,
        swapRandomCharacters,
        replaceRandomCharacter,
        repeatRandomCharacter,
        reverseRandomWord,
        shuffleWords,
        shuffleCharacters,
        duplicateRandomWord
    ];

    let output = input;

    for (let i = 0; i < varietyLevel; i++) {
        output = mutations[i % mutations.length](output);
    }

    return output;
}



function getRandomSymbol() {
  const randomIndex = getRandomInt(0, symbols.length - 1);
  const randomSymbol = symbols[randomIndex];
  return randomSymbol
}

function capitalizeRandomCharacter(str) {
    const index = Math.floor(Math.random() * str.length);
    return str.substring(0, index) + str.charAt(index).toUpperCase() + str.substring(index + 1);
}

function insertRandomCharacter(str) {
    const index = Math.floor(Math.random() * str.length);
    const randomChar = getRandomSymbol(); // Define getRandomSymbol() function appropriately
    return str.substring(0, index) + randomChar + str.substring(index);
}

function removeRandomCharacter(str) {
    const index = Math.floor(Math.random() * str.length);
    return str.substring(0, index) + str.substring(index + 1);
}

function swapRandomCharacters(str) {
    const index1 = Math.floor(Math.random() * str.length);
    let index2 = Math.floor(Math.random() * str.length);
    while (index2 === index1) {
        index2 = Math.floor(Math.random() * str.length);
    }
    const temp = str[index1];
    const arr = str.split('');
    arr[index1] = arr[index2];
    arr[index2] = temp;
    return arr.join('');
}

function replaceRandomCharacter(str) {
    const index = Math.floor(Math.random() * str.length);
    const randomChar = getRandomSymbol(); // Define getRandomSymbol() function appropriately
    return str.substring(0, index) + randomChar + str.substring(index + 1);
}

function repeatRandomCharacter(str) {
    const index = Math.floor(Math.random() * str.length);
    return str.substring(0, index) + str.charAt(index).repeat(2) + str.substring(index);
}

function reverseRandomWord(str) {
    const words = str.split(' ');
    const index = Math.floor(Math.random() * words.length);
    words[index] = words[index].split('').reverse().join('');
    return words.join(' ');
}

function shuffleWords(str) {
    const words = str.split(' ');
    for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
    }
    return words.join(' ');
}

function shuffleCharacters(str) {
    const chars = str.split('');
    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
}

function duplicateRandomWord(str) {
    const words = str.split(' ');
    const index = Math.floor(Math.random() * words.length);
    words.splice(index, 0, words[index]);
    return words.join(' ');
}
