import axios from 'axios'

import { CONFIG } from '@/config.js'

var instance = axios.create({
    baseURL: CONFIG.ICWS_URL + "/api",
    timeout: 15000
});
export default {

    getAgentLoginState(request) {
        console.log("getAgentLoginState() received request=", request)
        let header = {
            'content-type': 'application/json',
            'set-cookie': request.cookie,
            'csrfToken': request.csrfToken,
            'sessionId': request.sessionId,
            'subscriptionId': request.subscriptionId
        };

        console.log("getAgentLoginState(): sending request. header=", header)

        return instance.get('/agent/connection', {
            headers: header
        }).then(response => {
            console.log("getAgentLoginState() response=", response.data)
            //process response
            return response.data
        }).catch(error => {
            console.log("getAgentLoginState() :  error=", error)
        })
    },
    /***************************************************************************************
     * Agent Login Request: used to log the agent into genesys
     ***************************************************************************************/
    agentLoginRequest(request) {
        console.log("agentLoginRequest() received request=", request)
        let header = {
            'content-type': 'application/json',
            'subscriptionId': request.subscriptionId
        }
        let body = {
            role: 'PMT',
            userId: request.userId,
            password: request.password,
            station: request.station
        };

        console.log("agentLoginRequest(): sending request. header=", header)
        console.log("agentLoginRequest(): sending request. body=", body)

        return instance.post('/agent/connection', body, {
            headers: header
        }).then(response => {
            console.log("agentLoginRequest() response=", response.data)
            //process response
            return response.data
        }).catch(error => {
            console.log("agentLoginRequest() :  error=", error)
            throw error
        })
    },

    dialerLoginRequest(request) {
        console.log("dialerLoginRequest() received request=", request)
        let header = {
            'content-type': 'application/json',
            'subscriptionId': request.subscriptionId,
            'set-cookie': request.cookie,
            'csrfToken': request.csrfToken,
            'sessionId': request.sessionId
        }
        let body = {
            userId: request.userId,
            campaignId: request.campaignId
        };

        console.log("dialerLoginRequest(): sending request. header=", header)
        console.log("dialerLoginRequest(): sending request. body=", body)

        return instance.post('/dialer/login', body, {
            headers: header
        }).then(response => {
            console.log("dialerLoginRequest() response=", response.data)
            //process response
            return response.data
        }).catch(error => {
            console.log("dialerLoginRequest() :  error=", error)
            throw error
        })
    },


    dialerLogoutRequest(request) {
        console.log("dialerLogoutRequest() received request=", request)
        let header = {
            'content-type': 'application/json',
            'subscriptionId': request.subscriptionId,
            'set-cookie': request.cookie,
            'csrfToken': request.csrfToken,
            'sessionId': request.sessionId
        }
        let body = {
            userId: request.userId,
        };

        console.log("dialerLogoutRequest(): sending request. header=", header)
        console.log("dialerLogoutRequest(): sending request. body=", body)

        return instance.post('/dialer/logout', body, {
            headers: header
        }).then(response => {
            console.log("dialerLogoutRequest() response=", response.data)
            //process response
            return response.data
        }).catch(error => {
            console.log("dialerLogoutRequest() :  error=", error)
            throw error
        })
    },

    /***************************************************************************************
     * Agent Logout Request: used to log the agent out of genesys. ALso unsubscribes from queues
    ***************************************************************************************/
    agentLogoutRequest(request) {
        console.log("agentLogoutRequest() received request=", request)
        let header = {
            'content-type': 'application/json',
            'set-cookie': request.cookie,
            'csrfToken': request.csrfToken,
            'sessionId': request.sessionId
        };
        let body = {
            'userId': request.userId,
            'subscriptionId': request.subscriptionId
        };

        console.log("agentLogoutRequest(): sending request. header=", header)
        console.log("agentLogoutRequest(): sending request. body=", body)

        instance.interceptors.request.use(config => {
            config.headers.post['set-cookie'] = request.cookie;
            config.headers.post['csrfToken'] = request.csrfToken;
            return config;
        });
        return axios.delete(CONFIG.ICWS_URL + '/api/agent/connection', {
            timeout: 5000,
            headers: header,
            data: body
        }).then(response => {
            console.log("agentLogoutRequest() response=", response.data)
            //process response
            return response.data
        }).catch(error => {
            console.log("agentLogoutRequest() :  error=", error)
            throw error
        })
    },

    /***************************************************************************************
    * Get Agent State: used to fetch agent status messages (Available, AUX , etc.)
    ***************************************************************************************/
    getStatusMessages(request) {
        console.log("getStatusMessages(): request received Request=", request)

        let header = {
            'content-type': 'application/json',
            'set-cookie': request.cookie,
            'csrfToken': request.csrfToken,
            'sessionId': request.sessionId,
            'subscriptionId': request.subscriptionId
        }

        return instance.get('/agent/statusMessages', {
            headers: header
        }).then(response => {
            console.log("getStatusMessages() response=", response)
            //process response
            return response
        }).catch(error => {
            console.log("getStatusMessages() :  error=", error)
            throw error
        })
    },
    /***************************************************************************************
     * Agent State Request: used to change agent state from ready to AUX, etc.
     ***************************************************************************************/
    agentStateChangeRequest(request) {
        console.log("agentStateChangeRequest() received request=", request)
        let header = {
            'content-type': 'application/json',
            'set-cookie': request.header.cookie,
            'csrfToken': request.header.csrfToken,
            'sessionId': request.header.sessionId,
            'subscriptionId': request.header.subscriptionId
        };
        let body = {
            userId: request.body.userId,
            statusId: request.body.statusId
        }
        console.log("agentStateChangeRequest(): sending request. header=", header)
        console.log("agentStateChangeRequest(): sending request. body=", body)

        return instance.put('/agent/status', body, {
            headers: header
        }).then(response => {
            console.log("agentStateChangeRequest() response=", response)
            //process response
            return response.data
        }).catch(error => {
            console.log("agentStateChangeRequest() :  error=", error)
            throw error
        })
    },


    /***************************************************************************************
     * Call Control Request: used to make requests to perform call related actions: 
     * Actions can be: answer, drop , hold or unhold depending
     ***************************************************************************************/
    callControlRequest(request) {
        console.log("callControlRequest(): request received Request=", request)
        let header = {
            'content-type': 'application/json',
            'set-cookie': request.cookie,
            'csrfToken': request.csrfToken,
            'sessionId': request.sessionId,
            'subscriptionId': request.subscriptionId
        }
        let body = null
        let answerbody = {
            interactionId: request.interactionId,
        };

        let holdBody = {
            interactionId: request.interactionId,
            holdParameters: {
                on: null
            }
        }
        let urlControlPath = request.controlType;
        if (request.controlType === "hold" || request.controlType === "unhold") {
            body = holdBody
            urlControlPath = "hold";
            body.holdParameters.on = request.controlType === "hold"
        }
        else {
            body = answerbody
        }
        console.log("callControlRequest(): sending request. header=", header)
        console.log("callControlRequest(): sending request. body=", body)
        return instance.post('/call/' + urlControlPath, body, {
            headers: header
        }).then(response => {
            console.log("callControlRequest() response=", response)
            //process response
            return response
        }).catch(error => {
            console.log("callControlRequest() :  error=", error)
            throw error
        })
    },

    /***************************************************************************************
     * Create an outbound call:Called when user clicks on a number on Salesforce
     ***************************************************************************************/
    createOutboundCall(request) {
        console.log("createOutboundCall(): request received Request=", request)
        let body = {
            __type: 'urn:inin.com:interactions:createCallParameters',
            target: request.body.targetNumber,
            workgroup: CONFIG.MANUAL_CALLING_WORKGROUP
        }
        let header = {
            'content-type': 'application/json',
            'set-cookie': request.header.cookie,
            'csrfToken': request.header.csrfToken,
            'sessionId': request.header.sessionId,
            'subscriptionId': request.header.subscriptionId
        }

        return instance.post('/call/outbound', body, {
            headers: header
        }).then(response => {
            console.log("createOutboundCall() response=", response)
            //process response
            return response
        }).catch(error => {
            console.log("createOutboundCall() :  error=", error)
            throw error
        })

    },


    /***************************************************************************************
     * Wrap-up Request: used to send call dispostion to genesys
     ***************************************************************************************/
    sendWrapUpRequestToGenesys(request) {
        console.log("sendWrapUpRequestToGenesys(): request received Request=", request)

        let header = {
            'content-type': 'application/json',
            'set-cookie': request.cookie,
            'csrfToken': request.csrfToken,
            'sessionId': request.sessionId,
            'subscriptionId': request.subscriptionId
        }
        console.log("sendWrapUpRequestToGenesys(): sending request. header=", header)

        //'call/:interactionId/code/:wrapupCode/wrapup'
        return instance.post('/call/' + request.interactionId + '/code/' + request.wrapupCode + '/wrapup', "", {
            headers: header
        }).then(response => {
            console.log("sendWrapUpRequestToGenesys() response=", response)
            //process response
            return response
        }).catch(error => {
            console.log("sendWrapUpRequestToGenesys() :  error=", error)
            throw error
        })

    },

    /***************************************************************************************
     * Dialer Wrap-up Request: used to send call dispostion to dialer
     ***************************************************************************************/
    sendWrapUpRequestToDialer(request) {
        console.log("sendWrapUpRequestToDialer(): request received Request=", request)

        let header = {
            'content-type': 'application/json',
            'set-cookie': request.cookie,
            'csrfToken': request.csrfToken,
            'sessionId': request.sessionId,
            'subscriptionId': request.subscriptionId
        }

        let body = {
            'userId': request.userId
        }

        console.log("sendWrapUpRequestToDialer(): sending request. header=", header)
        console.log("sendWrapUpRequestToDialer(): sending request. body=", body)
        //'call/:interactionId/code/:wrapupCode/wrapup'
        ///dialer/code/:wrapupCode/wrapup
        return instance.post('/dialer/code/' + request.wrapupCode + '/wrapup', body, {
            headers: header
        }).then(response => {
            console.log("sendWrapUpRequestToDialer(): response=", response)
            //process response
            return response
        }).catch(error => {
            console.log("sendWrapUpRequestToDialer(): error=", error)
            throw error
        })

    },

    /***************************************************************************************
     * Fetch Recording URL: used to get the audio recording URL from the recording ID. 
     * Note: The recording ID is retreived as a socket event when the call starts.
     ***************************************************************************************/
    fetchRecordingUrl(request) {
        console.log("fetchRecordingUrl(): request received Request=", request)

        let header = {
            'content-type': 'application/json',
            'set-cookie': request.header.cookie,
            'csrfToken': request.header.csrfToken,
            'sessionId': request.header.sessionId,
            'subscriptionId': request.header.subscriptionId
        }

        return instance.get('/call/recording/' + request.body.recordingId + '/recordingUri', {
            headers: header
        }).then(response => {
            console.log("fetchRecordingUrl() response=", response)
            //process response
            return response
        }).catch(error => {
            console.log("fetchRecordingUrl() :  error=", error)
            throw error
        })
    },


}