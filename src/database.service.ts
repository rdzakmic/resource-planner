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
            var self = this;
            openRequest.onupgradeneeded = function (e: any) {
                let thisDB = e.target.result;

                let teams = [{ id: 12, name: "Jon" }, { id: 122, name: "Absenger" }];
                let members = [{ id: 44, name: "Jon2 Doe" }, { id: 3444, name: "Jon Doe" }, { id: 222, name: "Jane Doe" }];
                let projects = [{ id: 11, name: "Change III Certus" }, { id: 22, name: "Change II Certus" }, { id: 33, name: "Urlaub" }];
                let availablesData = [
                    { id: 2, memberId: 44, week: "Mon Nov 13 2017 00:00:00 GMT+0100 (Central European Standard Time)", available: 5 },
                    { id: 1, memberId: 44, week: "Mon Nov 06 2017 00:00:00 GMT+0100 (Central European Standard Time)", available: 5, },
                    { id: 3, memberId: 44, week: "Mon Nov 20 2017 00:00:00 GMT+0100 (Central European Standard Time)", available: 5 },
                    { id: 4, memberId: 44, week: "Mon Nov 27 2017 00:00:00 GMT+0100 (Central European Standard Time)", available: 5 },
                    { id: 5, memberId: 3444, week: "Mon Nov 06 2017 00:00:00 GMT+0100 (Central European Standard Time)", available: 6, },
                    { id: 6, memberId: 3444, week: "Mon Nov 13 2017 00:00:00 GMT+0100 (Central European Standard Time)", available: 0, },
                    { id: 7, memberId: 3444, week: "Mon Nov 20 2017 00:00:00 GMT+0100 (Central European Standard Time)", available: 0, },

                ];

                if (!thisDB.objectStoreNames.contains("Teams")) {
                    let teamStore = thisDB.createObjectStore("Teams", { autoIncrement: true });
                    teams.forEach((element, index) => {
                        teamStore.put(element);
                    });
                }
                if (!thisDB.objectStoreNames.contains("Projects")) {
                    let objectStore = thisDB.createObjectStore("Projects", { autoIncrement: true });
                    projects.forEach((element, index) => {
                        objectStore.put(element, element.id);
                    });
                }
                if (!thisDB.objectStoreNames.contains("Member")) {
                    let objectStore = thisDB.createObjectStore("Member", { autoIncrement: true });
                    members.forEach((element, index) => {
                        objectStore.add(element, element.id);
                    });
                }

                if (!thisDB.objectStoreNames.contains("Availables")) {
                    let objectStore = thisDB.createObjectStore("Availables", { autoIncrement: true });
                    objectStore.createIndex("memberWeek", ["memberId", "week"], { unique: false });
                    availablesData.forEach((element, index) => {
                        objectStore.put(element, element.id);
                    });
                }

                if (!thisDB.objectStoreNames.contains("TeamMemberLookup")) {
                    let objectStore = thisDB.createObjectStore("TeamMemberLookup", { autoIncrement: true });
                    let teamMembersLookup: any[] = [];
                    teams.forEach((team) => {
                        members.forEach((member) => {
                            let temp = { teamId: team.id, memberId: member.id };
                            teamMembersLookup.push(temp);
                        });
                    });
                    teamMembersLookup.forEach((element, index) => {
                        objectStore.put(element, index);
                    });
                }
                if (!thisDB.objectStoreNames.contains("MemberProjectLookup")) {
                    let objectStore = thisDB.createObjectStore("MemberProjectLookup", { autoIncrement: true });
                    objectStore.createIndex("memberWeek", ["memberId", "projectId", "week"], { unique: false });
                    let lookupData = self.setMemberProjectLookupTable(members, projects);
                    lookupData.forEach((element, index) => {
                        objectStore.put(element, element.keyPath);
                    });
                }
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

    public getAvailables(weeks: string[], employeeId: number) {
        let mondays = weeks.slice();
        return new Promise((resolve: any, reject: any) => {
            let openRequest = indexedDB.open("ResourcePlanner", 1);
            openRequest.onsuccess = (event: any) => {
                this.db = event.target.result;
                let transaction = this.db.transaction(["Availables"], "readonly");
                let store = transaction.objectStore("Availables");
                let lowerBound = [employeeId, weeks[0]];
                let upperBound = [employeeId, weeks[weeks.length - 1]];
                let range = IDBKeyRange.bound(lowerBound, upperBound);
                let index = store.index('memberWeek').openCursor(range);
                let results: any[] = [];
                index.onsuccess = (event: any) => {
                    let cursor = event.target.result;
                    if (cursor) {
                        weeks.forEach((element, index) => {
                            if (element === cursor.value.week) {
                                results.push(cursor.value);
                                weeks.splice(index, 1);
                            }
                        });
                        cursor.continue();
                    }
                    else {
                        weeks.forEach((element) => {
                            results.push({
                                available: 0,
                                week: element,
                                memberId: employeeId
                            });
                        });
                        resolve(results);
                    }
                }
            }
            openRequest.onerror = function (e: any) {
                console.log("Error: ", e);
            }
        });
    }

    public getWeekProjectData(employeeId: number, project: any, week: string) {
        return new Promise((resolve: any, reject: any) => {
            this.openRequest = indexedDB.open("ResourcePlanner", 1);
            this.openRequest.onsuccess = (event: any) => {
                this.db = event.target.result;
                let transaction = this.db.transaction(["MemberProjectLookup"], "readonly");
                let store = transaction.objectStore("MemberProjectLookup");
                let index = store.index('memberWeek');
                var request = index.get(IDBKeyRange.only([employeeId, project.projectId, week]));
                request.onsuccess = (event) => {
                    if (event.target.result) {
                        resolve(event.target.result);
                    }
                    else {
                        resolve({
                            memberId: employeeId,
                            projectId: project.projectId,
                            projectName: project.projectName,
                            week: week,
                            year: "2017",
                            spent: 0
                        });
                    }
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
    public saveData(dataToSave: any[]) {
        return new Promise((resolve, reject) => {
            this.openRequest = indexedDB.open("ResourcePlanner", 1);
            this.openRequest.onsuccess = (event: any) => {
                this.db = event.target.result;
                let objectStore = this.db.transaction(["MemberProjectLookup"], "readwrite").objectStore("MemberProjectLookup");
                objectStore.openCursor().onsuccess = (event) => {
                    let cursor = event.target.result;
                    if (cursor) {
                        for (let i = 0; i < dataToSave.length; i++) {
                            if (dataToSave[i].week === cursor.value.week && dataToSave[i].memberId === cursor.value.memberId && dataToSave[i].projectId === cursor.value.projectId) {
                                cursor.value.spent = dataToSave[i].spent;
                                let requestUpdate = cursor.update(cursor.value);
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
                    else {
                        if (dataToSave.length > -1) {
                            dataToSave.forEach((element, i) => {
                                objectStore.put(element);
                                dataToSave.splice(i, 1);
                            });
                        }
                        resolve("save");
                    }
                    objectStore.onsuccess = () => {
                        console.log('Saved');
                    };
                };
            }
        })
    }

    public saveAvailableData(dataToSave: any[]) {
        return new Promise((resolve, reject) => {
            this.openRequest = indexedDB.open("ResourcePlanner", 1);
            this.openRequest.onsuccess = (event: any) => {
                let db = event.target.result;
                let objectStore = db.transaction(["Availables"], "readwrite").objectStore("Availables");
                // var index = objectStore.index("memberWeek");
                objectStore.openCursor().onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        dataToSave.forEach((element, i) => {
                            if (cursor.value.memberId === element.memberId && cursor.value.week === element.week) {
                                cursor.value.available = element.available;
                                cursor.update(cursor.value);
                                dataToSave.splice(i, 1);
                            }
                        });
                        cursor.continue();
                    }
                    else {
                        if (dataToSave.length > -1) {
                            dataToSave.forEach((element, i) => {
                                objectStore.put(element);
                                dataToSave.splice(i, 1);
                            });
                        }
                        resolve("save");
                    }
                };
            }
        })
    }

}