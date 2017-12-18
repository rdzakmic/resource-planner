// service file for working with database (adding, updating, saving) 
//also there is few records added to database
export class DataFetcher {
    private openRequest: any;
    private db: any;

    constructor() {
        var idbSupported = false;
        var db;
        if ("indexedDB" in window) {
            idbSupported = true;
        }

        if (idbSupported) {
            var openRequest = this.db = this.openRequest = indexedDB.open("ResourcePlanner", 1);

            openRequest.onupgradeneeded = function (e: any) {
                var thisDB = e.target.result;

                if (!thisDB.objectStoreNames.contains("Teams")) {
                    thisDB.createObjectStore("Teams", { autoIncrement: true });
                }
                if (!thisDB.objectStoreNames.contains("Projects")) {
                    thisDB.createObjectStore("Projects", { autoIncrement: true });
                }
                if (!thisDB.objectStoreNames.contains("Member")) {
                    thisDB.createObjectStore("Member", { autoIncrement: true });
                }
                if (!thisDB.objectStoreNames.contains("TeamMemberLookup")) {
                    thisDB.createObjectStore("TeamMemberLookup", { autoIncrement: true });
                }
                if (!thisDB.objectStoreNames.contains("MemberProjectLookup")) {
                    thisDB.createObjectStore("MemberProjectLookup", { autoIncrement: true });
                }
                if (!thisDB.objectStoreNames.contains("Availables")) {
                    thisDB.createObjectStore("Availables", { autoIncrement: true });
                }

            }

            openRequest.onsuccess = (e: any) => {
                db = e.target.result;
                let transaction = db.transaction(["Teams", "Projects", "Member", "TeamMemberLookup", "MemberProjectLookup", "Availables"], "readwrite");
                let storeTeams = transaction.objectStore("Teams", { keyPath: "id" });
                let storeProjects = transaction.objectStore("Projects");
                let storeMember = transaction.objectStore("Member");
                let storeTeamMemberLookup = transaction.objectStore("TeamMemberLookup");
                let storeMemberProjectLookup = transaction.objectStore("MemberProjectLookup");
                let storeAvailables = transaction.objectStore('Availables');


                let teams = [{ id: 12, name: "Alicic" }, { id: 122, name: "Absenger" }];

                let members = [{ id: 44, name: "Alen Helac" }, { id: 3444, name: "Adnan Alicic" }, { id: 222, name: "Alen Kalajevac" }];

                let projects = [{ id: 11, name: "Change III Certus" }, { id: 22, name: "Change II Certus" }, { id: 33, name: "Urlaub" }];

                let availablesData = [
                    { id: 1, memberId: 44, week: "Mon Nov 06 2017 00:00:00 GMT+0100 (Central European Standard Time)", available: 5, },
                    { id: 2, memberId: 44, week: "Mon Nov 13 2017 00:00:00 GMT+0100 (Central European Standard Time)", available: 5 },
                    { id: 3, memberId: 44, week: "Mon Nov 20 2017 00:00:00 GMT+0100 (Central European Standard Time)", available: 5 },
                    { id: 4, memberId: 44, week: "Mon Nov 27 2017 00:00:00 GMT+0100 (Central European Standard Time)", available: 5 },
                    { id: 5, memberId: 3444, week: "Mon Nov 06 2017 00:00:00 GMT+0100 (Central European Standard Time)", available: 6, },
                    { id: 6, memberId: 3444, week: "Mon Nov 13 2017 00:00:00 GMT+0100 (Central European Standard Time)", available: 0, },
                    { id: 7, memberId: 3444, week: "Mon Nov 20 2017 00:00:00 GMT+0100 (Central European Standard Time)", available: 0, },
                    { id: 8, memberId: 3444, week: "Mon Nov 27 2017 00:00:00 GMT+0100 (Central European Standard Time)", available: 0, }
                ];

                availablesData.forEach((element, index) => {
                    storeAvailables.add(element, index);
                });
                teams.forEach((element, index) => {
                    storeTeams.add(element, element.id);
                });
                members.forEach((element, index) => {
                    storeMember.add(element, element.id);
                });
                projects.forEach((element, index) => {
                    storeProjects.add(element, element.id);
                });

                let lookupData = this.setMemberProjectLookupTable(members, projects);
                lookupData.forEach((element, index) => {
                    storeMemberProjectLookup.add(element, element.keyPath);
                });

                let teamMembersLookup: { teamId: number, memberId: number }[] = [];
                teams.forEach((team) => {
                    members.forEach((member) => {
                        let temp = { teamId: team.id, memberId: member.id };
                        teamMembersLookup.push(temp);
                    });
                });
                teamMembersLookup.forEach((element, index) => {
                    let request = storeTeamMemberLookup.add(element, index);
                    request.onerror = function (e) {
                        console.log("Error", e.target.error.name);
                    }

                    request.onsuccess = function (e) {
                        console.log("Saved");
                    }
                });
            }

            openRequest.onerror = function (e) {
                console.log("Error", e);
            }

        }
    }

    public setMemberProjectLookupTable(employees: any, projects: any): any[] {
        let results: any[] = [];
        employees.forEach((employee, index) => {
            projects.forEach((project, index) => {
                let temp = {
                    memberId: employee.id,
                    projectId: project.id,
                    projectName: project.name,
                    week: "Mon Nov 06 2017 00:00:00 GMT+0100 (Central European Standard Time)",
                    year: "2017",
                    spent: 1
                }
                results.push(temp);
                results.push({
                    memberId: employee.id,
                    projectId: project.id,
                    projectName: project.name,
                    week: "Mon Nov 13 2017 00:00:00 GMT+0100 (Central European Standard Time)",
                    year: "2017",
                    spent: 1
                });
                results.push({
                    memberId: employee.id,
                    projectId: project.id,
                    projectName: project.name,
                    week: "Mon Nov 20 2017 00:00:00 GMT+0100 (Central European Standard Time)",
                    year: "2017",
                    spent: 1
                });
                results.push({
                    memberId: employee.id,
                    projectId: project.id,
                    projectName: project.name,
                    week: "Mon Nov 27 2017 00:00:00 GMT+0100 (Central European Standard Time)",
                    year: "2017",
                    spent: 1
                });
            });
        });
        return results;
    }
    public getTeamMembers(callback: any) {
        this.openRequest = indexedDB.open("ResourcePlanner", 1);
        this.openRequest.onsuccess = (event: any) => {
            this.db = event.target.result;
            let transaction = this.db.transaction(["Teams", "Member"], "readonly");
            let teamsStore = transaction.objectStore("Teams");

            teamsStore.getAll().onsuccess = function (event: any) {
                callback(event.target.result);
            }
        }
        this.openRequest.onerror = function (e: any) {
            console.log("Error", e);
        }
    }

    public getEmployees(teamId: number, callback: any) {
        this.openRequest = indexedDB.open("ResourcePlanner", 1);
        this.openRequest.onsuccess = (event: any) => {
            this.db = event.target.result;
            let transaction = this.db.transaction(["TeamMemberLookup"], "readonly");
            let teamsStore = transaction.objectStore("TeamMemberLookup");

            teamsStore.getAll().onsuccess = function (event: any) {
                let results = event.target.result;
                let returnData = [];
                for (let obj in results) {
                    if (results[obj].teamId === teamId) {
                        returnData.push(results[obj]);
                    }
                }
                callback(returnData);
            }
        }
        this.openRequest.onerror = function (e: any) {
            console.log("Error", e);
        }
    }

    public getAvailables() {
        return new Promise((resolve: any, reject: any) => {
            this.openRequest = indexedDB.open("ResourcePlanner", 1);
            this.openRequest.onsuccess = (event: any) => {
                this.db = event.target.result;
                let transaction = this.db.transaction(["Availables"], "readonly");
                let teamsStore = transaction.objectStore("Availables");

                teamsStore.getAll().onsuccess = (event: any) => {
                    let results = event.target.result;
                    resolve(results);
                }
            }
            this.openRequest.onerror = function (e: any) {
                console.log("Error", e);
            }
        });

    }


    public getEmployeeData(id: any, callback: any) {
        this.openRequest = indexedDB.open("ResourcePlanner", 1);
        this.openRequest.onsuccess = (event: any) => {
            this.db = event.target.result;
            let transaction = this.db.transaction(["Member"], "readonly");
            let memberStore = transaction.objectStore("Member");

            memberStore.get(id).onsuccess = function (event: any) {
                callback(event.target.result);
            }
        }
        this.openRequest.onerror = function (e: any) {
            console.log("Error", e);
        }
    }

    public getProjectsByEmployee(id: number, year: number, callback: any) {
        this.openRequest = indexedDB.open("ResourcePlanner", 1);
        this.openRequest.onsuccess = (event: any) => {
            this.db = event.target.result;
            let transaction = this.db.transaction(["MemberProjectLookup"], "readonly");
            let teamsStore = transaction.objectStore("MemberProjectLookup");
            teamsStore.getAll().onsuccess = (event: any) => {
                let results = event.target.result;
                let returnData = [];
                for (let i = 0; i < results.length; i++) {
                    if (results[i].memberId === id && year === new Date(results[i].week).getFullYear()) {
                        returnData.push(results[i]);
                    }
                }
                callback(returnData);
            }
        }
        this.openRequest.onerror = function (e: any) {
            console.log("Error", e);
        }
    }
    public saveData(dataToSave) {
        return new Promise((resolve, reject) => {
            this.openRequest = indexedDB.open("ResourcePlanner", 1);
            this.openRequest.onsuccess = (event: any) => {
                this.db = event.target.result;
                let objectStore = this.db.transaction(["MemberProjectLookup"], "readwrite").objectStore("MemberProjectLookup");
                objectStore.openCursor().onsuccess = (event) => {
                    var cursor = event.target.result;
                    if (cursor) {
                        for (let i = 0; i < dataToSave.length; i++) {
                            if (dataToSave[i].week === cursor.value.week && dataToSave[i].memberId === cursor.value.memberId && dataToSave[i].projectId === cursor.value.projectId) {
                                cursor.value.spent = dataToSave[i].spent;
                                var requestUpdate = cursor.update(cursor.value);
                                if (i > -1) {
                                    dataToSave.splice(i, 1);
                                }
                                requestUpdate.onsuccess = () => {
                                    console.log('Saved');
                                };
                            }
                        }
                        cursor.continue();
                    }
                    else{
                        resolve(true)
                    }
                };


            }
        })

    }

}