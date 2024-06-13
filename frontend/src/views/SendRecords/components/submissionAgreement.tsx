import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { DatsExcelModel } from '../../../utils/xlsxUtils';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const agreementTextSections = [
    {
        id: 1,
        content: `BC GOVERNMENT DIGITAL ARCHIVES\nDRAFT SUBMISSION AGREEMENT`,
        isTitle: true
    },
    {
        id: 2,
        content: `This is an agreement between BC's Digital Archives and the Ministry,\nfor the Transfer of government records under Application # [ApplicationNumber] and Accession # [AccessionNumber].`,
        isTitle: false
    },
    {
        id: 3,
        content: `The purpose of this agreement is to transfer Full Retention (FR) of government records,\nafter the date of their Final Disposition (FD), from the legal and physical custody of the Ministry to the Digital Archives.`,
        isTitle: false
    },
    {
        id: 4,
        content: `The Ministry and Digital Archives agree that:`,
        isTitle: false
    },
    {
        id: 5,
        content: `1. The Ministry currently holds legal and physical custody of the government records being transferred,`,
        isTitle: false
    },
    {
        id: 6,
        content: `2. The government records are subject to the Information Management Act (IMA), Freedom of Information and Protection of Privacy Act (FIPPA), and other relevant legislation.`,
        isTitle: false
    },
    {
        id: 7,
        content: `3. The government records meet all conditions outlined in the Managing Government Information Policy (MGIP) and RIM Manual Section 3.3 Transfer to Archives.`,
        isTitle: false
    },
    {
        id: 8,
        content: `4. None of the government records being transferred will be destroyed by the Ministry until the Digital Archives verifies the creation of Archival Information Packages (AIPs) in the preservation system, which completes the transfer process. After verification, the source information will be a redundant copy and will be destroyed appropriately by the Ministry, to reduce duplication and ensure a single source of truth.`,
        isTitle: false
    },
    {
        id: 9,
        content: `5. Upon completion of the transfer process, the Digital Archives will assume legal and physical custody and be responsible for the ongoing management of the archived government records on behalf of the Province.`,
        isTitle: false
    },
    {
        id: 10,
        content: `6. The Digital Archives will protect personal information and provide access to the government records in accordance with the Information Management Act (IMA), the Freedom of Information and Protection of Privacy Act, and other relevant legislation.`,
        isTitle: false
    }
];

const SubmissionAgreement = ({ validate, excelData }: { validate: (isValid: boolean, errorMsg: string) => void, excelData: DatsExcelModel | null }) => {
    const [value, setValue] = React.useState('');
    React.useEffect(() => { validate(false, ''); }, []);
    const applicationNumber = excelData?.applicationNumber ?? '';
    const accessionNumber = excelData?.accessionNumber ?? '';

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const agreed = event.target.value === 'agree';
        setValue(event.target.value);
        console.log(event.target.value);
        validate(agreed, !agreed ? 'Please accept the submission agreement' : '');
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                <Grid xs={12}>
                    <Item>
                        {agreementTextSections.map(section => (
                            <Typography
                                key={section.id}
                                sx={{ fontSize: section.isTitle ? 14 : 12 }}
                                fontWeight={section.isTitle ? 'bold' : 'normal'}
                                align={section.isTitle ? 'center' : 'left'}
                                gutterBottom
                            >
                                {section.content
                                    .replace('[ApplicationNumber]', applicationNumber)
                                    .replace('[AccessionNumber]', accessionNumber)}
                            </Typography>
                        ))}
                    </Item>
                    <FormLabel id="demo-controlled-radio-buttons-group">Do you agree with this Submission Agreement</FormLabel>
                    <RadioGroup
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        value={value}
                        onChange={handleChange}
                    >
                        <FormControlLabel value="agree" control={<Radio />} label="Agree" />
                        <FormControlLabel value="disagree" control={<Radio />} label="Reject" />
                    </RadioGroup>
                </Grid>
            </Grid>
        </Box>
    );
}
export default SubmissionAgreement;