function findDuplication(arr) {
  let duplicate = [];

  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] == arr[j] && !duplicate.includes(arr[i])) {
        duplicate.push(arr[i]);
      }
    }
  }

  return duplicate;
} 
console.log(findDuplication([4, 3, 2, 7, 8, 2,2, 3,3, 2, 2, 1]));
