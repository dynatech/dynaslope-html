const { expect } = chai;

describe("getSiteColumnNodeCount", () => {

	// it("should return node count == 12", () => {
	// 	getSiteColumnNodeCount("agbta")
	// 	.done((data) => {
	// 		const node_count = data;
	// 		expect(node_count).to.equal(12);
	// 	});
	// });

});

describe("delegateNodeNumbersOnDropdown", () => {

	it("should create <ul> for node list with id = node_list", () => {
		$("body").append($("<ul>", {
            id: "node-list"
        }));
        const find_tag = $("body").find("#node-list").length;
        expect(find_tag).to.equal(1);
	});

	it("should create list of nodes inside <ul> id = node-list", () => {
		getSiteColumnNodeCount("bakta")
		.done((node_count) => {
			delegateNodeNumbersOnDropdown(node_count);
            const find_tag = $("ul#node-list").find("li").length;
	    	expect(find_tag).to.equal(20);
        })
	    .catch(({ responseText, status: conn_status, statusText }) => {
            alert(`Status ${conn_status}: ${statusText}`);
            alert(responseText);
        });
	});

	it("should remove all created <ul> and <li> tags", () => {
		$("#node-list").remove();
		const find_tag = $("body").find("#node-list").length;
	    expect(find_tag).to.equal(0);
	});

});

describe("clearSelectedNodes", () => {
	 it("should create input type text for node value", () => {
	 	$("body").append($("<input>", {
            id: "nodes",
            type: "text",
            name: "nodes"
        }));
        const find_tag = $("body").find("#nodes").length;
	    expect(find_tag).to.equal(1);
	 });

	 it("should input a value text box", () => {
	 	const initial_value = $("#nodes").val("1, 2, 3");
	 	const get_value = $("#nodes").val();
	 	expect(get_value).to.equal("1, 2, 3");
	 });

	 it("should clear text box", () => {
	 	clearSelectedNodes();
	 	const get_value = $("#nodes").val();
	 	expect(get_value).to.equal("");
	 });

	 it("should remove input type", () => {
	 	$("#nodes").remove();
	 	const find_tag = $("body").find("#nodes").length;
	    expect(find_tag).to.equal(0);
	 });

});


