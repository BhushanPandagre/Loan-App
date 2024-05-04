import React, { useContext, useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { AuthContext } from "../App";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [loans, setLoans] = useState([]);
  const { user, token, setLoggedIn, setUser } = useContext(AuthContext);
  const [showDetails, updateShowDetails] = useState("-1");
  const navigate = useNavigate();

  const fetchLoans = async () => {
    try {
      const loanData = await axios.get(
        "http://localhost:5000/api/v1/loans",
        {
          headers: {
            "Content-Type": "application/json",
            bearertoken: token,
          },
        }
      );
      // Initialize additional amount to 0 for each repayment
      const loansWithInitializedAdditionalAmount = loanData.data.Loans.map(loan => {
        return {
          ...loan,
          repayments: loan.repayments.map(repayment => {
            return {
              ...repayment,
              additionalAmount: 0 // Initialize additional amount to 0
            };
          })
        };
      });
      setLoans(loansWithInitializedAdditionalAmount);
      console.log(loansWithInitializedAdditionalAmount);
    } catch (err) {
      console.error(err);
      toast.error(`Can't fetch the loans\nError: ${err}`);
    }
  };
  

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/v1/loans/update-status/`,
        { id, status },
        {
          headers: {
            "Content-Type": "application/json",
            bearertoken: token,
          },
        }
      );
      toast.success("Updated the loan status");
      window.location.reload(false);
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(`Can't update status!\nError:${error}`);
    }
  };

  const updatePayment = async (loanId, installmentId, additionalAmount) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/v1/loans/repay/`,
        { loanId, installmentId, additionalAmount },
        {
          headers: {
            "Content-Type": "application/json",
            bearertoken: token,
          },
        }
      );
      toast.success("Paid the installment");
      fetchLoans(); // Refresh the loans data after payment
    } catch (error) {
      console.error(error);
      toast.error(`Can't pay installment!\nError:${error}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/v1/loans/delete/${id}`, {
        headers: {
          "Content-Type": "application/json",
          bearertoken: token,
        },
      });
      toast.success("Loan deleted successfully");
      fetchLoans(); // Refresh the loans after deletion
    } catch (error) {
      console.error(error);
      toast.error(`Can't delete loan!\nError:${error}`);
    }
  };

  const handleLogout = () => {
    // Clear local storage and navigate to login page
    localStorage.removeItem("token");
    setLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  return (
    <div className="container mx-auto p-4">
      {user && user.user_type === "admin" ? (
        <div>
          <h3 className="text-2xl font-bold text-blue-800">Admin</h3>
        </div>
      ) : (
        <div>
          {user && <h3 className="text-2xl font-bold text-blue-800"> Name: {user.name}</h3>}
          {user && <h3 className="text-2xl font-bold text-blue-800"> Email: {user.email}</h3>}
        </div>
      )}

      <button
        className="bg-orange-600 text-white px-4 py-2 rounded mt-4"
        onClick={handleLogout}
      >
        Logout
      </button>

      {user && user.user_type === "admin" ? null : (
        <a href="/createLoan" className="text-blue-500 hover:underline block mt-4">
          Create New Loan +
        </a>
      )}

      {loans.length ? (
        <>
          <table className="min-w-full bg-white border border-gray-300 mt-4">
            <thead>
              <tr>
                {user.user_type === "admin" && <th>User Id</th>}
                {user.user_type === "admin" && <th>Name</th>}
                {user.user_type === "admin" && <th>Email</th>}
                <th>Amount</th>
                <th>Terms</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan, idx) => (
                <React.Fragment key={idx}>
                  <tr>
                    {user.user_type === "admin" && <td>{loan.user_id._id}</td>}
                    {user.user_type === "admin" && <td>{loan.user_id.name}</td>}
                    {user.user_type === "admin" && (
                      <td>{loan.user_id.email}</td>
                    )}
                    <td>{loan.amount}</td>
                    <td>{loan.terms}</td>
                    <td>{loan.status}</td>
                    <td>{loan.createdAt.slice(0, 10)}</td>
                    <td>
                      {user &&
                      user.user_type === "admin" &&
                      loan.status === "pending" ? (
                        <>
                          <button
                            className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                            onClick={() => updateStatus(loan._id, "accepted")}
                          >
                            Accept
                          </button>
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded"
                            onClick={() => updateStatus(loan._id, "rejected")}
                          >
                            Reject
                          </button>
                        </>
                      ) : loan.status !== "rejected" ? (
                        <>
                          <button
                            className="bg-green-400 text-white px-3 py-1 rounded"
                            onClick={() => updateShowDetails(loan._id)}
                          >
                            View Details
                          </button>{" "}
                        </>
                      ) : (
                        <button
                          className="bg-gray-300 text-gray-600 px-3 py-1 rounded"
                          disabled
                        >
                          Rejected :(
                        </button>
                      )}
                    </td>
                    {user.user_type === "admin" && (
                      <td>
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded"
                          onClick={() => handleDelete(loan._id)}
                        >
                          Delete
                        </button>
                      </td>
                    )}

                  </tr>
                  {showDetails === loan._id && (
                    <>
                      {/* {loan} */}
                      <h2>Total Amount: {loan.amount}</h2>
                      <h2>Remaining Amount: {loan.remainingAmount}</h2>
                      <table>
                        <thead>
                          <tr>
                            <th>Amount</th>
                            <th>Due</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loan.repayments.map((repay, index) => (
                            <tr key={index}>
                              <td>
                                {/* Display the total amount by summing up repay.amount and repay.additionalAmount */}
                                {parseFloat(repay.amount) + (repay.additionalAmount || 0)}
                              </td>
                              <td>{repay.date.slice(0, 15)}</td>
                              <td>{repay.status}</td>
                              <td>
                                {repay.status === "pending" ? (
                                  <div>
                                    <input
                                      type="number"
                                      placeholder="Enter additional amount"
                                      onChange={(e) => {
                                        const additionalAmount = parseFloat(e.target.value) || 0; // If NaN, default to 0
                                        const updatedRepayments = [...loan.repayments];
                                        updatedRepayments[index].additionalAmount = additionalAmount;
                                        setLoans((prevLoans) => {
                                          const updatedLoans = [...prevLoans];
                                          updatedLoans[idx].repayments = updatedRepayments;
                                          return updatedLoans;
                                        });
                                      }}
                                      className="border border-gray-300 rounded px-2 py-1 mr-2"
                                    />
                                    <button
                                      disabled={loan.status !== "accepted"}
                                      onClick={() => {
                                        updatePayment(loan._id, repay._id, repay.additionalAmount);
                                      }}
                                      className="bg-green-500 text-white px-3 py-1 rounded"
                                    >
                                      Repay
                                    </button>
                                  </div>
                                ) : (
                                  <button disabled className="bg-gray-300 text-gray-600 px-3 py-1 rounded">
                                    Paid :)
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p className="text-center mt-4">No loans found!</p>
      )}
    </div>
  );
};

export default Home;