import { DataFetcher } from './database.service';
import { Table } from "./Table";
import * as $ from "jquery";
import "bootstrap";
import { Observable } from "rx";



class ResourcePlanner {
    private databaseConn: any;
    public static teamId: number;
    private database: DataFetcher;
    private year: number = 2017;
    public static projectsEmployeesData: any = {};
    constructor() {
        this.database = new DataFetcher();
        this.addMembersToDropdown();
        this.showButton();
    }

    public getDataForTable(team: any) {
        ResourcePlanner.projectsEmployeesData[team.id] = {};
        this.database.getEmployees(parseInt(team.id), (results: any) => {
            this.GetProjects(results, team);
        });
    }

    public GetProjects(results: any, team: number) {
        for (let i = 0; i < results.length; i++) {
            this.database.getProjectsByEmployee(results[i].memberId, 2017, (data: any) => {
                this.database.getEmployeeData(results[i].memberId, (employee: any) => {
                    ResourcePlanner.projectsEmployeesData[team.id]["teamMember"] = team;
                    ResourcePlanner.projectsEmployeesData[team.id][employee.id] = {
                        employee: employee,
                        data: data
                    }
                });
            });
        }
    }

    public showButton() {
        let showBtn = document.getElementById("show-table");
        showBtn.addEventListener('click', () => {
            for(var key in ResourcePlanner.projectsEmployeesData){
                new Table(ResourcePlanner.projectsEmployeesData[key], this.year);
            }
        });
    }

    public addMembersToDropdown() {
        this.database.getTeamMembers((teams: any) => {
            teams.forEach((element: any) => {
                var label = document.createElement('label');
                label.setAttribute("class", "form-check-label dropdown-item");
                let checkbox = document.createElement("input");
                checkbox.setAttribute("type", "checkbox");
                checkbox.setAttribute("class", "form-check-input");
                checkbox.setAttribute("value", element.id);
                checkbox.addEventListener("click", (e: any) => {
                    this.getDataForTable(element);
                });
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(element.name));
                var appendTo = document.getElementById("dropdown-team").appendChild(label);
            });
        });
    }
}

window.onload = () => {
    new ResourcePlanner();

    $(".filter-button").click(function () {
        $(".filter-row").toggle();
    });

}
