function findmissingNumber(arr, n) {
  for (let i = 0; i < n; i++) {
    if (i + 1 !== arr[i]) {
      return i + 1;
    }
  }
  return "No number is missing";
}

console.log(findmissingNumber([1, 2, 3, 5,6], 5));
