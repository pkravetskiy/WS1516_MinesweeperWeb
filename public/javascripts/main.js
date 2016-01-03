function fill_grid(x, y, jsonData) {
  var obj = JSON.parse(jsonData);
  field = obj.get("field");
  for (i=0; i < x; i++) {
    for (j=0; j < y; j++) {
      var value = "";
      switch (field[i][j].value) {
        case -1:
          value = "M";
          break;
        case 0:
          value = "";
          break;
        default:
          value = field[i][j].value;
      }
      document.getElementById(i + "-" + j).textContent = value;
    }
  }
}

function click(x, y) {

}
