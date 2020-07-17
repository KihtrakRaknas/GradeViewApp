export function prepareAssignmentsObjectForSectionList(assignments){
    assignments = assignments.sort((a, b) => b["Timestamp"] - a["Timestamp"]);
    var listOfAssignments = [];
    var lastAssignment;
    var tempList = []
    for (var assignment of assignments) {
      if (lastAssignment != null && lastAssignment["Date"] != assignment["Date"]) {
        var title = lastAssignment["Date"].replace("\n", " ")
        if (!title)
          title = "No date"
        listOfAssignments.push({
          title: title,
          data: tempList,
        });
        tempList = [];
      }

      tempList.push(assignment);

      lastAssignment = assignment;
    }
    if (assignment) {
      var title = assignment["Date"].replace("\n", " ")
      if (!title)
        title = "No date"
      listOfAssignments.push({
        title: title,
        data: tempList,
      });
    }
    return listOfAssignments;
  }

  export function getAssignmentsFromClassAndMP(obj,className,markingPeriod){
    let miniAssignments = []
    var teacher = obj[className]['teacher']
    for (var assignment of obj[className][markingPeriod]["Assignments"]) {
      assignment['teacher'] = teacher;
      assignment['className'] = className;
      var year = "19"; //years in this case don't matter. All that matters is one year is greater than the other
      if (assignment["Date"].includes("\n")) {
        if (parseInt((assignment["Date"].split("\n")[1]).split("/")[0]) > 6)
          year = "18";
        assignment["Timestamp"] = Date.parse(assignment["Date"] + "/" + year);
      } else {
        assignment["Timestamp"] = Date.parse("12/12" + year - 2);
      }
      miniAssignments.push(assignment);
    }
    return miniAssignments
  }