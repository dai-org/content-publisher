import React, { useState, useRef, useEffect } from "react";
import { useHistory, Redirect } from "react-router-dom";
import { useAuth } from "../components/provideAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modali, { useModali } from "modali";
import {
  query,
  where,
  onSnapshot,
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { sendEmailApprover } from "../admin/index";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const name = useRef();
  const roles = useRef();
  const status = useRef();
  const emails = useRef();
  const [exampleModal, toggleExampleModal] = useModali({
    animated: true,
    large: true,
    closeButton: true,
    title: "Request Access",
  });
  const uploadButton = useRef();

  // Get auth state and re-render anytime it changes
  const auth = useAuth();
  const history = useHistory();

  const [adminEmail, setadminEmail] = useState("");

  useEffect(() => {
    const db = getFirestore();
    const q = query(
      collection(db, "appDistro"),
      where("roles", "==", "SysAdmin")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc);
      });
      setadminEmail(items[0].email);
    });
    return unsubscribe;
  }, [auth]);

  return auth.user ? (
    <Redirect
      to={{
        pathname: "/upload",
        state: { from: "/" },
      }}
    />
  ) : (
    <div className="table-container auth-wrapper">
      <div className="auth-wrapper">
        <img alt="" src="logo512.png" style={{ width: 125, marginRight: 10 }} />

        <Modali.Modal {...exampleModal}>
          <div className="cp-form-inner mb-5 mt-5 col-12 px-md-5 justify-content-center">
            <div>
              <div className="input-group mb-3 w-75">
                <span className="input-group-text">Name</span>
                <textarea
                  className="form-control"
                  rows="2"
                  ref={name}
                ></textarea>
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">Email Address</span>
                <textarea
                  className="form-control"
                  rows="2"
                  ref={emails}
                ></textarea>
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">Role</span>
                <select className="form-select" multiple={false} ref={roles}>
                  <option value="Publisher">Content Publisher</option>
                  <option value="Approver">Content Approver</option>
                  <option value="NewsletterPublisher">
                    Newsletter Publisher
                  </option>
                  <option value="SysAdmin">System Admin</option>
                </select>
              </div>

              <button
                type="button"
                className="btn btn-success w-100 round-10"
                ref={uploadButton}
                onClick={async (event) => {
                  const data = {
                    name: name.current.value,
                    email: email.current.value,
                    date: serverTimestamp(),
                    publishedBy: name.current.value,
                    publishedOn: serverTimestamp(),
                    status: status.current.value,
                    roles: roles.current.value,
                    password: Math.random().toString(36).slice(4),
                  };
                  toast.success(
                    "Your request for an account has been sent and is awaiting approval and once approved a temporary email will be sent to you.",
                    {
                      position: "top-center",
                      autoClose: 5000,
                      hideProgressBar: true,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: false,
                      progress: 0,
                    }
                  );
                  sendEmailApprover(adminEmail, "New User Request");
                  const docRef = await addDoc(
                    collection(getFirestore(), "appUsers"),
                    data
                  );
                  console.log("Document written with ID: ", docRef.id);
                  name.current.value = "";
                  email.current.value = "";
                  roles.current.value = "Publisher";
                }}
              >
                Submit Request
              </button>
              <ToastContainer />
            </div>
          </div>
        </Modali.Modal>
        <h4 className="mb-4">DAI Content Publisher</h4>
        <div className="auth-inner">
          <div>
            <h3>Sign In</h3>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                aria-describedby="emailHelp"
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={async (event) => {
                await auth.signin(email, password);
                history.push("/upload");
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              style={{ padding: 20 }}
              className="btn btn-default w-100"
              onClick={async (event) => {
                toggleExampleModal();
              }}
            >
              Request Account
            </button>
            <ToastContainer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
