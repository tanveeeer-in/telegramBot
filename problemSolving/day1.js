function linearSearch(arr, tar) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === tar) {
      return "found it at index", i;
    }
  }
  return "Targetd value is not in given array";
}
 console.log(linearSearch([10, 20, 30, 40, 50], 60));

// function binarySearch(arr1, tar1) {
//   const arr = [2, 4, 6, 7, 8, 10, 12];
//   const tar = 7;
//   for (let i = 0; i < arr.length; i++) {
//     let middle = Math.floor(arr.length / 2);
//     let left = middle-1;
//     let right = arr[middle]+1;
//     console.log(middle, left, right);
//     if (arr[middle] === tar) {
//       console.log("found in middle", i);
//       return;
//     } else if (arr[middle] > tar) {
//       console.log("left");

//     } else if (arr[middle] < tar) {
//       console.log("right");

//     }
//   }
   console.log("there is no value");
//   return;
// }

function binarySearch(arr, high, low, tar) {
  if (low > high) {
    return "Target not found";
  }
  let mid = Math.floor((low + high) / 2);
  if (arr[mid] === tar) {
    console.log("found middle at index", mid);
    return mid;
  } else if (arr[mid] > tar) {
    console.log("left");
    high = mid - 1;
    return binarySearch(arr, high, low, tar);
  } else if (arr[mid] < tar) {
    console.log("right");
    low = mid + 1;
    return binarySearch(arr, high, low, tar);
  }
}
let arr = [2, 4, 6, 8, 10, 12];
let high = arr.length - 1;
let low = 0;
binarySearch(arr, high, low, 112);
