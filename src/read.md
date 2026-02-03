function findResetLocally(timeZoneId) {
const now = Math.floor(Date.now() / 1000);
const ONE_HOUR = 3600;

    // Helper to get offset without an API call
    const getOffset = (unixTs) => {
        const date = new Date(unixTs * 1000);
        // This uses the built-in IANA database in your browser/Node
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: timeZoneId,
            timeZoneName: 'shortOffset'
        }).formatToParts(date);

        return parts.find(p => p.type === 'timeZoneName').value;
    };

    let initialOffset = getOffset(now);
    console.log(`Initial Offset for ${timeZoneId}: ${initialOffset}`);

    for (let i = 1; i <= 24; i++) {
        let futureUnix = now + (i * ONE_HOUR);
        let currentOffset = getOffset(futureUnix);

        if (currentOffset !== initialOffset) {
            console.log(`Change detected at hour ${i}!`);
            console.log(`New Offset: ${currentOffset}`);
            return futureUnix;
        }
    }

    console.log("No change in the next 24 hours.");
    return null;

}

// Use the ID you got from your first Google API call
findResetLocally("America/Los_Angeles");
