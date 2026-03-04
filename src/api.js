import API from "../api";
import { useEffect, useState } from "react";

import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api"
});

export default API;