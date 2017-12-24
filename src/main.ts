import { DataFetcher } from './database.service';
import { Table } from "./Table";
import * as $ from "jquery";
import "bootstrap";


class ResourcePlanner {
    private database: DataFetcher;
    private year: number;
    public static projectsEmployeesData: any = {};
    private tablesToRemove: any[] = [];

    constructor() {
        this.database = new DataFetcher();
        this.addMembersToDropdown();
        this.showButton();
    }

    public getDataForTable(team: any) {
        this.database.getEmployees(parseInt(team.id), (results: any) => {
            this.GetProjects(results, team);
        });
    }

    public GetProjects(results: any, team: any) {
        ResourcePlanner.projectsEmployeesData[team.id] = {
            team: team,
            members: []
        };
        for (let i = 0; i < results.length; i++) {
            this.database.getProjectsByEmployee(results[i].memberId, this.year, (data: any) => {
                this.database.getEmployeeData(results[i].memberId, (employee: any) => {
                    ResourcePlanner.projectsEmployeesData[team.id].members.push({
                        employee: employee,
                        data: data
                    });
                });
            });
        }
    }

    public showButton() {
        let showBtn = document.getElementById("show-table");
        this.year = parseInt($("#year").val());
        let self = this;
        $("#year").on('change', function () {
            self.year = this.value;
        })

        showBtn.addEventListener('click', () => {
            this.tablesToRemove.forEach(((tableId) => {
                let table = document.getElementById(tableId);
                if (table) {
                    table.parentNode.removeChild(table);
                }
            }));
            for (var key in ResourcePlanner.projectsEmployeesData) {
                if (!document.getElementById(key)) {
                    new Table(ResourcePlanner.projectsEmployeesData[key], this.year);
                }
            }
        });
    }

    public addMembersToDropdown() {
        this.database.getTeamMembers((teams: any) => {
            teams.forEach((team: any) => {
                var label = document.createElement('label');
                label.setAttribute("class", "form-check-label dropdown-item");
                let checkbox = document.createElement("input");
                checkbox.setAttribute("type", "checkbox");
                checkbox.setAttribute("class", "form-check-input");
                checkbox.setAttribute("value", team);
                let self = this;
                checkbox.addEventListener("change", function (e: any) {
                    if (this.checked === false) {
                        delete ResourcePlanner.projectsEmployeesData[team.id];
                        self.tablesToRemove.push(team.id);
                    }
                    else {
                        self.getDataForTable(team);
                    }
                });
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(team.name));
                var appendTo = document.getElementById("dropdown-team").appendChild(label);
            });
        });
    }
}

window.onload = () => {
    new ResourcePlanner();

    $(".filter-button").click(function () {
        $(".filter-row").toggle();
        $(".plus-sign").toggle();
        $(".minus-sign").toggle();
    });

}
