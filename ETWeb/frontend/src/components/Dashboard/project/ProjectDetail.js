import React from 'react';
import axios from 'axios';
import * as projects from '../../../services/projectsService'
import { Link } from 'react-router-dom'
import { Spinner } from 'reactstrap'
import {
    Card,
    Table,
    CardHeader,
    CardFooter,
    CardBody,
    CardTitle,
    CardText
} from 'reactstrap';
import { NotFound } from '../../Pages'


export default class ProjectDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: props.user,
            name: undefined,
            description: undefined,
            members: [],
            employeeStatuses: {},
            socket: undefined,
        };
        this.reqSource = undefined;
        this._isMounted = false;
    }

    setState = (...args) => {
        if (this._isMounted) {
            super.setState(...args);
        }
    };

    initWebsocket() {
        const { host, protocol } = location;
        const url = `${protocol === "http:" ? "ws" : "wss"}://${host}/master/`;
        console.log("Connecting to ", url);

        const socket = new WebSocket(url);

        socket.onopen = event => {
            socket.send(JSON.stringify({
                type: "project.employees.status",
                project_id: this.state.id
            }));
        };

        socket.onmessage = event => {
            console.log(
                // event.data,
                // event
            );
            const data = JSON.parse(event.data);
            switch(data.type) {
                case "websocket.accept": {
                    console.log("Websocket connection established. ", data);
                    break;
                }
                case "websocket.message": {
                    console.log(data.text);
                    break;
                }
                case "employee.status": {
                    const prevStatuses = this.state.employeeStatuses;
                    this.setState({employeeStatuses: {...prevStatuses, [data.user_id]: data.status}});
                    break;
                }
                default: {
                    console.log("Unknown message of type: ", data.type);
                }
            }
        };

        socket.onclose = event => {
            console.log("Websocket connection closed. ", event.reason, event);
        };

        socket.onerror = event => {
            console.log("Websocket error. ", event.reason, event);
        };

        this.setState({
            socket
        });
    }

    loadProjectInfo = async id => {
        await this.cancelPreviousRequests();
        const {user} = this.state;
        try {
            const response = await projects.getProject(id, {user: {...user}}, this.reqSource.token);
            console.log("Project loaded.", response.data);
            const {data} = response;

            const employeeStatuses = {};
            data.members.forEach(m => {
                employeeStatuses[m.id] = "offline";
            });
            this.setState({
                ...data,
                employeeStatuses
            });
        } catch (error) {
            console.error(error.message);
            if (error.response.status === 400) {
                const fieldErrors = error.response.data;
                Object.keys(fieldErrors).map((fieldName) => {
                    fieldErrors[fieldName] = fieldErrors[fieldName].join(" ");
                    console.log(fieldErrors[fieldName]);
                });

                this.setState({
                    errors: fieldErrors
                });
            }
        }
    };

    cancelPreviousRequests = async () => {
        if (this.reqSource) {
            this.reqSource.cancel();
        }
        this.reqSource = axios.CancelToken.source();
    };

    async componentDidMount() {
        this._isMounted = true;
        const { match: { params } } = this.props;
        await this.loadProjectInfo(params.id);
        this.initWebsocket();
    }

    async componentWillUnmount() {
        this._isMounted = false;
        await this.cancelPreviousRequests();
    }

    renderMembersTable() {
        const { user, members, employeeStatuses } = this.state;
        if (members === undefined) {
            console.error("renderMembersTable() called when information about the project was not loaded");
            return;
        }
        // console.log(members);
        return (
            <div>
                <Table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>Status</th>
                            <th>Email</th>
                            <th>Account Registration Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((m, idx) => (
                            <tr className={m.is_staff ? "staff-user" : ""} key={`${m.id}`}>
                                <th scope="row">{idx + 1}</th>
                                <td>
                                    <Link
                                        to={m.id === user.id ? "/dashboard/profile" : `/dashboard/activity-logs/user/${m.id}`}
                                        className="username-link"
                                    >
                                        @{m.username}
                                    </Link>
                                </td>
                                <td className={`text-center ${employeeStatuses[m.id]}`}>{employeeStatuses[m.id]}</td>
                                <td>{m.email || <span className="text-secondary">No email provided.</span>}</td>
                                <td>{new Date(Date.parse(m.date_joined)).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <div className="color-explained d-flex">
                    <span className="staff-user disabled d-inline-block" style={{width: "20px", height: "20px"}}/>
                    <span className="d-inline-block small ml-sm-1">- staff users</span>
                </div>
            </div>
        );
    }

    render() {
        const { id, name, description } = this.state;

        if (id === undefined) {
            return <Spinner/>
        }
        if (id === null) {
            return <NotFound/>
        }

        return (
            <Card>
                <CardHeader tag="h3">{name}</CardHeader>
                <CardBody>
                    <CardTitle className="font-italic">Description:</CardTitle>
                    <CardText>{description}</CardText>

                    <CardTitle className="font-italic">Members:</CardTitle>
                    {this.renderMembersTable()}
                </CardBody>
                <CardFooter>Owners: </CardFooter>
            </Card>
        );
    }
};

