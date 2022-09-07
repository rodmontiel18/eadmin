import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import Categories from './Categories/Categories';
import Layout from './Layout/Layout';
import NotFound from './NotFound/NotFound';
import OutcomeGroupDetail from './OutcomeGroups/OutcomeGroupDetail';
import PaymentMethods from './PaymentMethods/PaymentMethods';
import PeriodDetail from './Periods/PeriodDetail';
import Periods from './Periods/Periods';
import SignIn from './Sign/SignIn';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Periods />} />
          <Route path="categories" element={<Categories />} />
          <Route path="paymentMethods" element={<PaymentMethods />} />
          <Route path="periods" element={<Outlet />}>
            <Route index element={<Periods />} />
            <Route path=":periodId" element={<PeriodDetail />} />
          </Route>
          <Route
            path="outcome-group/:groupId"
            element={<OutcomeGroupDetail />}
          />
          <Route path="signin" element={<SignIn />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
