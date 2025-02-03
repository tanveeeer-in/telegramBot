function firstRepeatingElement(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] == arr[j]) {
        return arr[i];
      }
    }
  }
}
// console.log(firstRepeatingElement([10, 5, 3, 4, 3, 5, 6]));

function firstRepeatingElementWithSet(arr) {
  const set = new Set();
  console.log(set);
  for (let i = 0; i < arr.length; i++) {
    if (set.has(arr[i])) {
      return arr[i];
    }
    set.add(arr[i]);
  }
  return "No repeating element";
}
console.log(firstRepeatingElementWithSet([10, 52, 30,12 ,33, 4, 3, 5, 6]));
