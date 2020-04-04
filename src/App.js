import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Pagination from '@material-ui/lab/Pagination';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

var styleBtn = {
    margin: 10,
    padding: 5,
    borderStyle: 'solid',
    cursor: 'pointer'
}

// https://stackoverflow.com/questions/56554586/how-to-use-usestyle-to-style-class-component-in-material-ui
const styles = theme => ({
    paginationUl: {justifyContent: 'flex-end'}
});

const SITE_ROOT = window.location.protocol + "//" + window.location.host; //"https://fotki.sadrobot.su"
const IMG_PAGE_SIZE = 100;

class ShareOptions extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selImgSrc: "medium",
            linkToGallery: true,
            setImgWidth: true,
            imgWidth: 800,
            setImgHeight: false,
            imgHeight: 600
        };
    }
    
    handleImgSrcChange = (event) => {
        this.setState({selImgSrc: event.target.value});
    }
    
    handleLinkToGalleryChange = (event) => {
        this.setState({linkToGallery: event.target.checked});
    }
    
    handleSetImgWidthChange = (event) => {
        this.setState({setImgWidth: event.target.checked});
    }
    
    handleSetImgHeightChange = (event) => {
        this.setState({setImgHeight: event.target.checked});
    }
    
    handleWidthTxtChange = (event) => {
        this.setState({imgWidth: event.target.value});
    }
    
    handleHeightTxtChange = (event) => {
        this.setState({imgHeight: event.target.value});
    }
    
    handleCopyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    }
    
    render() {
        var embedTxt = "";
        for(var i = 0; i < this.props.images.length; i++) {
            var img = this.props.images[i];
            
            var imgPath = (this.state.selImgSrc === "orig") ?
                img.path : img.urls.derivatives[this.state.selImgSrc].url;
            
            var imgEmbedTxt = "<img src='" + SITE_ROOT + "/" + imgPath + "' alt='" + img.file + 
                (this.state.setImgWidth ? ("' width='" + this.state.imgWidth) : "") +
                (this.state.setImgHeight ? ("' height='" + this.state.imgHeight) : "") +
                "'/>";
            
            // wrap img to link to image's page in gallery
            if(this.state.linkToGallery) {
                imgEmbedTxt  = "<a href='" + SITE_ROOT + "/picture.php?/" + img.id  + "'>" +
                    imgEmbedTxt + "</a>";
            }
            
            embedTxt += imgEmbedTxt + "\n";
        }
        
        return (
            <Box display="flex" p={1}>
                <Box p={1} flexGrow={1}>
                    <TextareaAutosize placeholder="No selected images — nothing to embed" value={embedTxt}
                        style={{width: "100%", height: 400, overflow: 'auto'}}/>
                </Box>
                
                <Box p={1}>
                    <Paper>
                        <FormControl style={{margin: 20}}>
                            <InputLabel id="select-imgsrc-label">Image source</InputLabel>
                            <Select
                                    labelId="select-imgsrc-label"
                                    value={this.state.selImgSrc}
                                    onChange={this.handleImgSrcChange}>
                                <MenuItem value={"square"}>square (120x120)</MenuItem>
                                <MenuItem value={"thumb"}>thumb (max dim = 144)</MenuItem>
                                <MenuItem value={"2small"}>2small</MenuItem>
                                <MenuItem value={"xsmall"}>xsmall</MenuItem>
                                <MenuItem value={"small"}>small</MenuItem>
                                <MenuItem value={"medium"}>medium</MenuItem>
                                <MenuItem value={"large"}>large</MenuItem>
                                <MenuItem value={"xlarge"}>xlarge</MenuItem>
                                <MenuItem value={"xxlarge"}>xxlarge</MenuItem>
                                <MenuItem value={"orig"}>orig</MenuItem>
                            </Select>
                            
                            <span style={{marginTop: 20}}>
                                <Checkbox color="primary" checked={this.state.setImgWidth}
                                    onChange={this.handleSetImgWidthChange}/>
                                <TextField
                                    variant="filled"
                                    disabled={!this.state.setImgWidth}
                                    label="Image width"
                                    defaultValue={this.state.imgWidth}
                                    onChange={this.handleWidthTxtChange}/>
                            </span>
                            <span style={{marginTop: 20}}>
                                <Checkbox color="primary" checked={this.state.setImgHeight}
                                    onChange={this.handleSetImgHeightChange}/>
                                <TextField
                                    variant="filled"
                                    disabled={!this.state.setImgHeight}
                                    label="Image height"
                                    defaultValue={this.state.imgHeight}
                                    onChange={this.handleHeightTxtChange}/>
                            </span>
                            <FormControlLabel style={{marginTop: 20, marginLeft: 0}}
                                control={
                                    <Checkbox color="primary"
                                        checked={this.state.linkToGallery}
                                        onChange={this.handleLinkToGalleryChange}/>
                                }
                                label="Link to gallery"/>
                        </FormControl>
                    </Paper>
                    
                    <Button
                        variant="contained" color="primary"
                        style={{marginTop: 20}}
                        onClick={() => this.handleCopyToClipboard(embedTxt)}>Copy to clipboard</Button>
                </Box>
            </Box>
        );
    }
}

class App extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            reply: '', 
            showShare: false,
            checked: [],
            category: {
                id: null, name: 'ROOT', representativePictureId: -1, idUppercat: null,
                representativePicture: null,
                childCats: [],
                parentCats: [],
                images: [],
                img_count: 0
            },
            pagesEnabled: true,
            page: 1
        };
        
        this.gotoCategory();
    }
    
    readServerString(url, callback) {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if (req.readyState === 4) { // only if req is "loaded"
                if (req.status === 200) { // only if "OK"
                    callback(undefined, req.responseText);
                } else {
                    // error
                    callback(new Error(req.status));
                }
            }
        };
        // can't use GET method here as it would quickly 
        // exceede max length limitation
        req.open("POST", url, true);

        //Send the proper header information along with the request
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.send();
    }
    
    loadCategory = (cat_id, page) => {
        var query_str = '/plugins/piwigo4blog/api/category.php';
        var img_params = "";
        if(this.state.pagesEnabled) {
            img_params = "img_lim=" + IMG_PAGE_SIZE + "&img_offset=" + (IMG_PAGE_SIZE * (page-1));
        }
        
        if(cat_id !== undefined) {
            query_str += '?id=' + cat_id + (img_params.length > 0 ? ("&" + img_params) : "");
        } else if(img_params.length > 0) {
            query_str += '?' + img_params;
        }
        
        this.readServerString(query_str, function(err, res) {
            if(!err) {
                this.setState({category: JSON.parse(res), page: page});
            } else {
                this.setState({category: [], page: page});
            }
        }.bind(this));
    }
    
    gotoCategory = (cat_id) => {
        this.loadCategory(cat_id, 1);
    }
    
    gotoPage = (page) => {
        this.loadCategory(this.state.category.id, page);
    }
    
    handleClickSelectAll = () => {
        var newChecked = [];
        for(var i=0; i < this.state.category.images.length; i++) {
            newChecked.push(this.state.category.images[i].id);
        }
        this.setState({checked: newChecked});
    }
    
    handleClickSelectNone = () => {
        this.setState({checked: []});
    }
    
    handleClickShare = () => {
        this.setState({showShare: true});
    }
    
    handleCloseShare = value => {
        this.setState({showShare: false});
    }
    
    handleToggle = (img_id) => {
        const currentIndex = this.state.checked.indexOf(img_id);
        const newChecked = [...this.state.checked];

        if (currentIndex === -1) {
          newChecked.push(img_id);
        } else {
          newChecked.splice(currentIndex, 1);
        }
        
        this.setState({checked: newChecked});
    }
    
    togglePagesEnabled = () => {
        this.setState({pagesEnabled: !this.state.pagesEnabled}, () => {
            this.loadCategory(this.state.category.id, 1);
        });
    }
    
    render() {
        const { classes } = this.props;
        
        // would only be used if this.state.pagesEnabled == true
        var pageCount = this.state.category.img_count > 0 ?
            Math.trunc((this.state.category.img_count - 1) / IMG_PAGE_SIZE) + 1 : 1;
        
        var selImages = [];
        for(var i=0; i < this.state.category.images.length; i++) {
            if(this.state.checked.indexOf(this.state.category.images[i].id) !== -1) {
                selImages.push(this.state.category.images[i]);
            }
        }
        
        return (
            <div style={{textAlign: 'center', marginTop: 30}}>
                
                <Breadcrumbs style={{marginBottom: 10}} aria-label="breadcrumb">
                    {this.state.category.id !== null && <Link color="inherit" onClick={() => this.gotoCategory()}>
                        ROOT
                    </Link>}
                    {this.state.category.parentCats.map(catPathElem => {
                        return (
                            <Link color="inherit" onClick={() => this.gotoCategory(catPathElem.id)}>
                                {catPathElem.name}
                            </Link>
                        );
                    })}
                    
                    <Typography style={{fontWeight: 'bold'}} color="textPrimary">{this.state.category.name}
                        {this.state.category.img_count > 0 && <span> [{this.state.category.img_count}]</span>}
                    </Typography>
                </Breadcrumbs>
                
                {this.state.category.img_count > 0 && <div style={{textAlign: 'right', marginBottom: 10}}>
                    <Button
                        variant="contained" color='primary'
                        style={{margin: 5, marginRight: 20}}
                        onClick={this.handleClickShare}>Встроить в блог</Button>
                    <Button
                        variant="contained"
                        style={{margin: 5}}
                        onClick={this.handleClickSelectAll}>Выбрать всё</Button>
                    <Button
                        variant="contained"
                        style={{margin: 5, marginRight: 20}}
                        onClick={this.handleClickSelectNone}>Снять выделение</Button>
                    
                    <FormControlLabel
                        control={<Switch checked={this.state.pagesEnabled} onChange={this.togglePagesEnabled}/>}
                        label="pages"/>
                </div>}
                
                {(this.state.pagesEnabled && this.state.category.img_count > 0) && <Pagination classes={{ul: classes.paginationUl}}
                    count={pageCount}
                    page={this.state.page}
                    style={{marginBottom: 10}}
                    color="primary"
                    onChange={(event, page) => this.gotoPage(page)} />}
                
                {this.state.category.childCats.length > 0 && <Grid container spacing={3}>
                    {this.state.category.childCats.map(cat => {
                        return (
                            /* 12-column grid layout: xs=3 => 4 cols; https://material-ui.com/components/grid/ */
                            <Grid item xs={3}>
                                <Paper style={{cursor: 'pointer', padding: 10, backgroundColor: '#DEDEDC', fontWeight: 'bold'}}>
                                    <div onClick={() => this.gotoCategory(cat.id)}>
                                        <div style={{height: 200}}>
                                            {cat.representativePicture != null &&
                                                <img style={{maxWidth: 300, maxHeight: 200}}
                                                    src={cat.representativePicture.urls.derivatives['xsmall'].url}
                                                    alt={cat.representativePicture.file}/>
                                            }
                                        </div>
                                        <div>{cat.name}</div>
                                    </div>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>}
                
                {this.state.category.images.length > 0 && <Grid container spacing={3}>
                    {this.state.category.images.map(img => {
                        return (
                            /* 12-column grid layout: xs=3 => 4 cols; https://material-ui.com/components/grid/ */
                            <Grid item xs={3}>
                                <Paper style={{cursor: 'pointer', padding: 10}} onClick={() => this.handleToggle(img.id)}>
                                    <div style={{height: 200}}>
                                        <img style={{maxWidth: 300, maxHeight: 200}} src={img.urls.derivatives['xsmall'].url} alt={img.file}/>
                                    </div>
                                    <div>
                                        <Checkbox
                                            color="primary"
                                            checked={this.state.checked.indexOf(img.id) !== -1}/>
                                        {img.name}
                                    </div>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>}
                
                {(this.state.pagesEnabled && this.state.category.img_count > 0) &&<Pagination classes={{ul: classes.paginationUl}}
                    count={pageCount}
                    page={this.state.page}
                    style={{marginTop: 10}}
                    color="primary"
                    onChange={(event, page) => this.gotoPage(page)} />}
                
                    <DialogTitle>Share</DialogTitle>
                <Dialog
                        fullWidth={true} maxWidth='lg'
                        open={this.state.showShare}
                        onClose={this.handleCloseShare}>
                    {/* DialogTitle uses Typography component with h2 tag by default, a kind of
                       weird magic happens with h1 and h2 tags when used on admin page in Piwigo:
                       - h1 added here get contents of page title defined in admin.tpl
                       - h2 gets display: 'none' global CSS property
                       - (also go to admin.tpl and try to change h2 to h1 inside titlePage
                          for even more weird behavior) */}
                    <DialogTitle disableTypography={true}>
                        <Typography variant="h6" style={{textAlign: 'left', fontWeight: 'bold'}}>Share</Typography>
                    </DialogTitle>
                    <DialogContent>
                        <ShareOptions images={selImages}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCloseShare} color="primary">Close</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

// https://stackoverflow.com/questions/56554586/how-to-use-usestyle-to-style-class-component-in-material-ui
//export default App;
export default withStyles(styles) (App);

