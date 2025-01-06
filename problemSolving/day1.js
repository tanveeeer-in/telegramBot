function linearSearch(arr, tar) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === tar) {
      return "found it at index", i;
    }
  }
  return "Targetd value is not in given array";
}
console.log(linearSearch([10, 20, 30, 40, 50], 60));
