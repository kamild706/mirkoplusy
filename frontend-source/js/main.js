var showErrorMessage = function(message) {
    $("#container").html("<div id=\"error\">" + message + "</div>");
};

var showData = function(content) {
    $.get("/mirkoplusy/template.html", function(template) {
        var rendered = Mustache.render(template.toString(), content);
        $("#container").html(rendered);
        console.log("here");
    });
};

var getThisShit = function() {
    return {
        author: undefined,
        date: undefined,
        voters: {
            men: [],
            women: [],
            unknown: []
        },
        votesNumber: undefined,
        get menNumber() {
            return this.voters.men.length;
        },
        get womenNumber() {
            return this.voters.women.length;
        },
        get unknownNumber() {
            return this.voters.unknown.length;
        },
        percent: function() {
            return function(param, render) {
                if (this.votesNumber === 0)
                    return 0;
                else
                    return Math.round(render(param) / this.votesNumber * 100 * 100) / 100;
            }
        }
    };
};

var sortBySex = function(sortedObject, votersToSort) {
    votersToSort.forEach(function(voter) {
        switch (voter["author_sex"]) {
            case "male":
                sortedObject.voters.men.push(voter["author"]);
                break;
            case "female":
                sortedObject.voters.women.push(voter["author"]);
                break;
            default:
                sortedObject.voters.unknown.push(voter["author"]);
        }
    });
};

var getEntryFromApi = function(id, callback) {
    $.ajax({
        url: "https:/a.wykop.pl/entries/index/" + id + "/appkey,RgQhsRN5lT",
        type: "GET",
        success: function(response) {
            callback(JSON.parse(JSON.stringify(response)));
        },
        error: function() {
            showErrorMessage("Wystąpił nieprzewidziany błąd");
        },
        timeout: 10000
    });
};

var processEntry = function(id) {
    $(".loadingSpinner").show();
    $("#container").html("");

    getEntryFromApi(id, function(response) {
        if (response["error"]) {
            showErrorMessage(response["error"]["message"]);
            $(".loadingSpinner").hide();
            return;
        }

        var data = getThisShit();
        data["author"] = "Autor wpisu: " + response["author"];
        data["date"] = response["date"];
        data['votesNumber'] = response["vote_count"];

        sortBySex(data, response["voters"]);
        showData(data);

        $("#url").val(response["url"]);
        window.history.pushState("", "", "/mirkoplusy/wpis/" + id);
        $(".loadingSpinner").hide();
    });

};

var processComment = function(entryId, commentId) {
    $(".loadingSpinner").show();
    $("#container").html("");

    commentId = Number(commentId);
    getEntryFromApi(entryId, function(response) {
        if (response["error"]) {
            showErrorMessage(response["error"]["message"]);
            $(".loadingSpinner").hide();
            return;
        }

        var commentFound = false;
        for (var i = 0; i < response["comments"].length; i++) {
            if (response["comments"][i]["id"] === commentId) {
                commentFound = true;
                break;
            }
        }

        if (commentFound) {
            var data = getThisShit();
            data["author"] = "Autor komentarza: " + response["comments"][i]["author"];
            data["date"] = response["comments"][i]["date"];
            data['votesNumber'] = response["vote_count"];

            sortBySex(data, response["comments"][i]["voters"]);
            showData(data);

            $("#url").val(response["url"]);
            // window.history.pushState("", "", "/mirkoplusy/wpis/" + entryId + "/komentarz/" + commentId);
        }
        else showErrorMessage("Komentarz nie istnieje, lub został usunięty");

        $(".loadingSpinner").hide();
    });
};

var isIdValid = function(id) {
    return null !== id && id.length > 0 && !isNaN(id);
};

var parseInput = function(url) {
    if (/wpis\/(\d+)\/#comment-(\d+)$/g.exec(url)) //whether url points to a comment
        return processComment(RegExp.$1, RegExp.$2);

    if (/wpis\/(\d+)(\/(?!#comment)|$)/g.exec(url))  //whether url points to an entry
        return processEntry(RegExp.$1);

    if (isIdValid(url)) //when user enters id
        return processEntry(url);

    showErrorMessage("Wprowadź adres lub identyfiktor wpisu");
};

$(function() {
    $(".loadingSpinner").hide();
    $("#container").html("");


    if (/wpis\/(\d+)\/?(?:komentarz\/)?(\d+)?/g.exec(window.location.href)) {
        if (isIdValid(RegExp.$1) && isIdValid(RegExp.$2))
            processComment(RegExp.$1, RegExp.$2);

        if (isIdValid(RegExp.$1) && !isIdValid(RegExp.$2))
            processEntry(RegExp.$1);
    }

    $("body").keyup(function(event) {
        if (event.keyCode === 13) $("#btn").click();
    });

    $("#btn").click(function() {
        parseInput($("#url").val().trim());
    });
});
