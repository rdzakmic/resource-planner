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
        let table = $("#content-to-clone").clone().attr({ style: "display:block", id: this.data.team.id }).appendTo($("#table-clone-in"));
        table.find("p").html(this.data.team.name);
        let tableBody = table.find('tbody')[0];
        this.data.members["Total"] = [];
        for (let record in this.data.members) {
            if (record !== "Total") {
                let tableRow = ($("<tr />").append($("<td />", { "text": this.data.members[record].employee.name })));
                tableBody.appendChild(this.createRow(this.data.members[record], tableRow[0], this.data.team));
            }
            else {
                let tableRow = ($("<tr />").append($("<td />", { "text": record })));
                this.createTotalRow(tableRow[0], this.data.team);
                tableBody.appendChild(tableRow[0]);
            }
        }
    }
    private createTotalRow(totalRow: HTMLElement, teamData: any) {
        for (let i = 0; i <= 11; i++) {
            let td = document.createElement("td");
            let idtowatch = "." + teamData.name + teamData.id + "-" + i;
            totalRow.appendChild(td);
            $(idtowatch).on("change", (event) => {
                var val = $(idtowatch).map(function (elem, is) {
                    let floatNum = parseFloat(($(this).val()).slice(0, -1));
                    if (!isNaN(floatNum)) {
                        return (floatNum);
                    }
                }).get();
                if (val.length === 0) {
                    td.innerHTML = "0%"
                }
                else {
                    td.innerHTML = (val.reduce((a, b) => a + b, 0)) / val.length + "%";
                }
            })
        }
    }

    private createRow(employeeProjects: { data: any, employee: any }, tableRow: HTMLElement, team: any) {

        for (let i = 0; i <= 11; i++) {
            let monthWeeks = Table.getMondays(this.year, i);
            let monthTd = document.createElement("td");
            let inputTd = document.createElement("input");
            inputTd.setAttribute("class", team.name + team.id + "-" + i);
            monthTd.appendChild(inputTd);
            tableRow.appendChild(monthTd);
            this.getMonthDataOfUser(monthWeeks, employeeProjects).then((monthUserData: any) => {
                this.generateEventListiner(inputTd, monthUserData);
                inputTd.value = monthUserData.monthPrecentage;
                var event = new Event('change');
                inputTd.dispatchEvent(event);
            });
        }
        return tableRow;
    }

    private getMonthDataOfUser(monthWeeks: string[], employeeProjectsData: any) {
        let employee = employeeProjectsData.employee;
        return new Promise((resolve: any, reject: any) => {
            let firstMondays = monthWeeks.slice();
            this.database.getAvailables(firstMondays, employee.id).then((availablesWeeks: any[]) => {
                let monthAvailability = 0;
                let spentTimeByWeek = 0;
                availablesWeeks.forEach((availableWeekData) => {
                    monthAvailability = monthAvailability + availableWeekData.available;
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
                    monthWeeks: availablesWeeks,
                    employeeProjectsData: employeeProjectsData,
                    month: monthWeeks
                }
                if (monthAvailability !== 0) {
                    let num = spentTimeByWeek / monthAvailability * 100;
                    data.monthPrecentage = (parseFloat(num.toString()).toFixed(2)) + "%";
                }
                resolve(data);
            });
        });
    }

    private generateEventListiner(tdHtmlElement: HTMLElement, data: any) {
        tdHtmlElement.addEventListener("click", (event) => {
            $('#modalLabel').empty();
            let year = new Date(data.month[0]).getFullYear();
            let month = new Date(data.month[0]).toLocaleString("en-us", {month: "long"});
            $('#modalLabel').text(month + " " + year + " " + "( " + data.employeeProjectsData.employee.name + " )");
            this.createModalTable(data, tdHtmlElement);
            $("#UserModal").modal();
        });
    }

    private createModalTable(data: any, monthTd: HTMLElement) {
        //  debugger;
        this.createModalTableHeader(data.monthWeeks);
        $('#modal-table-body').empty();
        $("#save-btn").on("click", (e) => {
            this.saveData(monthTd, data.month, data.employeeProjectsData);
        });

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

        let projectRecords = this.prepareProjectsByWeeks(data.employeeProjectsData.data);

        for (let key in projectRecords) {
            let projectRow = document.createElement("tr");
            let projectNameTd = document.createElement("td");
            projectNameTd.innerText = key;
            projectRow.appendChild(projectNameTd);
            data.monthWeeks.forEach(weekAvlb => {
                this.database.getWeekProjectData(data.employeeProjectsData.employee.id, projectRecords[key], weekAvlb.week).then((proj) => {
                    let projectTd = document.createElement("td");
                    let projectInput = document.createElement("input");
                    projectInput.value = proj.spent;
                    projectTd.appendChild(projectInput);
                    projectRow.appendChild(projectTd);
                    projectInput.addEventListener("change", (event) => {
                        let addData = Object.assign({}, proj);
                        addData.spent = parseInt(event.target.value);
                        addData.week = weekAvlb.week;
                        this.projectsToSave.push(addData);
                    });
                });
            });
            $('#modal-table-body').append(projectRow);
        }
    }
    private prepareProjectsByWeeks(projects: any[]): any[] {
        let uniqueProjects: any = {};
        projects.forEach((project) => {
            if (!uniqueProjects.hasOwnProperty(project.projectName)) {
                uniqueProjects[project.projectName] = {
                    projectId: project.projectId,
                    projectName: project.projectName
                };
            }
        });
        return uniqueProjects;
    };

    private createModalTableHeader(weeks: any[]): void {
        $('#modal-table-head').empty();
        $('#modal-table-head').append("<td>Project(s)</td>");
        $.each(weeks, (index, value) => {
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
    private saveData(monthTd: HTMLElement, monthWeeks: string[], employeeProjectsData: any) {
        if (this.projectsToSave.length > 0 || this.availablesTOSave.length > 0) {
            this.database.saveAvailableData(this.availablesTOSave).then((feedback) => {
                this.database.saveData(this.projectsToSave).then((data) => {
                    this.database.getProjectsByEmployee(employeeProjectsData.employee.id, this.year, (data) => {
                        let passData = {
                            data: data,
                            employee: employeeProjectsData.employee
                        }
                        this.getMonthDataOfUser(monthWeeks, passData).then((monthData) => {
                            this.generateEventListiner(monthTd, monthData);
                            monthTd.value = monthData.monthPrecentage;
                            let event = new Event('change');
                            monthTd.dispatchEvent(event);
                        })
                    })
                })
            });
        }
    }
}