var controller = {
    getOpenGraphProps: (url) => {
        fetch(uri) //download the data
            .then(function (res) {
                if (res.status != 200) {
                    return {
                        errMsg: "looks like there's a problem fetching the given url",
                        StatusCode: res.status
                    }
                }
                return res.json();
            })
            .catch(function (err) {
                console.log('Fetch Error :-S', err);
            });
        å
    }
}