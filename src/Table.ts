import { DataFetcher } from './database.service';

export class Table {
    private data: any = {};
    private database: DataFetcher;
    private year: number;
    public availablesTOSave: any[] = [];
    public projectsToSave: any[] = [];
    constructor(data: any, year: number) {
        this.year = year;
        this.database = new DataFetcher();
        this.data = data;
        this.generateTable();
    };

    public generateTable() {
        let table = $("#content-to-clone").clone().attr({ style: "display:block", id: "" }).appendTo($("#table-clone-in"));
        table.find("p").html(this.data.teamMember.name);
        let tableBody = table.find('tbody')[0];
        for (let records in this.data) {
            if(records !== "teamMember"){
                this.createRow(this.data[records], tableBody);
            }
            
        }
    }

    private createRow(employeeProjects: { data: any, employee: any }, table: HTMLElement) {
        let tableRow = ($("<tr />").append($("<td />", { "text": employeeProjects.employee.name })));
        for (let i = 0; i <= 11; i++) {
            let monthWeeks = Table.getMondays(this.year, i);
            this.getMonthDataOfUser(monthWeeks, employeeProjects).then((monthUserData: any) => {
                let monthTd = document.createElement("td");
                this.generateEventListiner(monthTd, monthUserData);
                monthTd.innerText = monthUserData.monthPrecentage;
                tableRow.append(monthTd);
            });
        }
        table.appendChild(tableRow[0]);
    }

    private getMonthDataOfUser(monthWeeks: string[], employeeProjectsData: any) {
        let employee = employeeProjectsData.employee;
        return new Promise((resolve: Function, reject: Function) => {
            this.extractAvailableDataForSpecificMonthAndUser(monthWeeks, employee).then((availablesWeeks: any[]) => {
                let monthAvailability = 0;
                let spentTimeByWeek = 0;
                availablesWeeks.forEach((availableWeekData) => {
                    monthAvailability += availableWeekData.available;
                });
                employeeProjectsData.data.forEach((element: any) => {
                    availablesWeeks.forEach((availableWeekData) => {
                        if (availableWeekData.week === element.week) {
                            spentTimeByWeek += element.spent;
                        }
                    })
                });

                let data = {
                    monthPrecentage: "-",
                    monthWeeks: this.prepareWeeksData(monthWeeks, availablesWeeks, employee.id),
                    employeeProjectsData: employeeProjectsData,
                    month:monthWeeks
                }
                if (monthAvailability !== 0) {
                    data.monthPrecentage = (spentTimeByWeek / monthAvailability * 100).toString() + "%";
                }
                resolve(data);

            });
        });
    }

    private prepareWeeksData(weeks: any[], availableWeeks: any[], employeeID: number): any[] {
        let weekData: any[] = [];
        if (availableWeeks.length === 0) {
            weeks.forEach(week => {
                weekData.push({
                    available: 0,
                    memberId: employeeID,
                    week: week
                })
            });
            return weekData;
        }
        else {
            weeks.forEach((week, index) => {
                weekData.push({
                    available: 0,
                    memberId: employeeID,
                    week: week
                });
                availableWeeks.forEach((weekAvlb) => {
                    if (week === weekAvlb.week && weekAvlb.available > 0) {
                        weekData[index] = weekAvlb;
                    }
                })
            });
            return weekData;
        }
    }

    private extractAvailableDataForSpecificMonthAndUser(monthWeeks: string[], employeeData) {
        return new Promise((resolve: Function, reject: Function) => {
            this.database.getAvailables().then((availableWeeksData: any[]) => {
                let returnResults: any[] = [];
                availableWeeksData.forEach((availableWeekData) => {
                    monthWeeks.forEach((week) => {
                        if (week === availableWeekData.week && employeeData.id === availableWeekData.memberId) {
                            returnResults.push(availableWeekData);
                        }
                    })
                })
                resolve(returnResults);
            });
        })
    }
    private generateEventListiner(tdHtmlElement: HTMLElement, data: any) {
        tdHtmlElement.addEventListener("click", (event) => {
            this.createModalTable(data, tdHtmlElement);
            $("#UserModal").modal();
        });
    }

    private createModalTable(data: any, monthTd:HTMLElement) {
        this.createModalTableHeader(data.monthWeeks);
        $('#modal-table-body').empty();
        $("#save-btn").on("click", (e) => {
            this.saveData(monthTd, data.month, data.employeeProjectsData);
        })
        let availableRow = document.createElement("tr");
        let availableNameTd = document.createElement("td");
        availableNameTd.innerText = "Available";
        availableRow.appendChild(availableNameTd);
        data.monthWeeks.forEach(element => {
            let availableNameTd = document.createElement("td");
            let avlbInput = document.createElement("input");
            avlbInput.value = element.available;
            avlbInput.addEventListener("change", (e) => {
                element.available = parseInt(e.target.value);
                this.availablesTOSave.push(element);
            });
            availableNameTd.appendChild(avlbInput);
            availableRow.appendChild(availableNameTd);
        });
        $('#modal-table-body').append(availableRow);

        let projectRecords = this.prepareProjectsByWeeks(data.employeeProjectsData.data, data.monthWeeks);
        for (let key in projectRecords) {
            let projectRow = document.createElement("tr");
            let projectNameTd = document.createElement("td");
            
            projectNameTd.innerText = projectRecords[key][0].projectName;
            projectRow.appendChild(projectNameTd);

            data.monthWeeks.forEach(weekAvlb => {

                if (projectRecords[key].length > 0) {
                    projectRecords[key].forEach(project => {
                        if(weekAvlb.week === project.week){
                            let projectTd = document.createElement("td");
                            let projectInput = document.createElement("input");
                            projectInput.addEventListener("change", (event) => {
                                let addData = Object.assign({}, project);
                                addData.spent = parseInt(event.target.value);
                                addData.week = weekAvlb.week;
                                this.projectsToSave.push(addData);
                            });
                            projectInput.value = project.spent;
                            projectTd.appendChild(projectInput);
                            projectRow.appendChild(projectTd);
                        }
                        
                    });                    
                }
                
            });
            $('#modal-table-body').append(projectRow);
        }
    }
    private prepareProjectsByWeeks(projects: any[], weeks: any[]): any[] {
        let returnData: any = {};
        let projectArray: any[] = [];
        // debugger;
        projects.forEach((project) => {
            if (!returnData.hasOwnProperty(project.projectName)) {
                returnData[project.projectName] = [];
            }
            weeks.forEach((week) => {
                if (week.week === project.week) {
                    returnData[project.projectName].push(project);
                }
            })

        });
        return returnData;
    };

    private createModalTableHeader(weeks: any[]): void {
        $('#modal-table-head').empty();
        $('#modal-table-head').append("<td>Project(s)</td>");
        $.each(weeks, function (index, value) {
            $('<td />', {
                "scope": "col",
                'text': new Date(value.week).toLocaleDateString()
            }).appendTo('#modal-table-head');
        });
    }

    static getMondays(year: number, month: number): string[] {
        var d = new Date(year, month),
            month = d.getMonth(),
            mondays = [];
        d.setDate(1);
        // Get the first Monday in the month
        while (d.getDay() !== 1) {
            d.setDate(d.getDate() + 1);
        }
        // Get all the other Mondays in the month
        while (d.getMonth() === month) {
            mondays.push((new Date(d.getTime())).toString());
            d.setDate(d.getDate() + 7);
        }
        return mondays;
    }

    private saveData(monthTd:HTMLElement, monthWeeks:string[], employeeProjectsData:any) {
        if(this.projectsToSave.length > 0){
            this.database.saveData(this.projectsToSave).then((data) => {
               this.database.getProjectsByEmployee(employeeProjectsData.employee.id, this.year, (data) => {
                  let passData = {
                       data: data,
                       employee: employeeProjectsData.employee
                   }
                   this.getMonthDataOfUser(monthWeeks, passData).then((monthData) => {
                    this.generateEventListiner(monthTd, monthData);
                    monthTd.innerText = monthData.monthPrecentage;
                   })
               })
            })

        }

    }
}